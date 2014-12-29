define(['controller/selectionController', 'model/cacheModel', 'model/usuarioMasterModel', 'component/_CRUDComponent', 'controller/tabController', 'component/usuarioComponent',
 'component/usuarioComponent', 'component/eventoComponent'],
 function(SelectionController, CacheModel, UsuarioMasterModel, CRUDComponent, TabController, UsuarioComponent,
 contactoUsComponent, eventosUsComponent) {
    App.Component._UsuarioMasterComponent = App.Component.BasicComponent.extend({
        initialize: function() {
            var self = this;
            this.configuration = App.Utils.loadComponentConfiguration('usuarioMaster');
            App.Model.UsuarioMasterModel.prototype.urlRoot = this.configuration.context;
            this.componentId = App.Utils.randomInteger();
            
            this.masterComponent = new UsuarioComponent();
            this.masterComponent.initialize();
            
            this.childComponents = [];
			
			this.initializeChildComponents();
            
            Backbone.on(this.masterComponent.componentId + '-post-usuario-create', function(params) {
                self.renderChilds(params);
            });
            Backbone.on(this.masterComponent.componentId + '-post-usuario-edit', function(params) {
                self.renderChilds(params);
            });
            Backbone.on(this.masterComponent.componentId + '-pre-usuario-list', function() {
                self.hideChilds();
            });
            Backbone.on('usuario-master-model-error', function(error) {
                Backbone.trigger(uComponent.componentId + '-' + 'error', {event: 'usuario-master-save', view: self, message: error});
            });
            Backbone.on(this.masterComponent.componentId + '-instead-usuario-save', function(params) {
                self.model.set('usuarioEntity', params.model);
                if (params.model) {
                    self.model.set('id', params.model.id);
                } else {
                    self.model.unset('id');
                }

				App.Utils.fillCacheList(
					'contactoUs',
					self.model,
					self.contactoUsComponent.getDeletedRecords(),
					self.contactoUsComponent.getUpdatedRecords(),
					self.contactoUsComponent.getCreatedRecords()
				);

				App.Utils.fillCacheList(
					'eventosUs',
					self.model,
					self.eventosUsComponent.getDeletedRecords(),
					self.eventosUsComponent.getUpdatedRecords(),
					self.eventosUsComponent.getCreatedRecords()
				);

                self.model.save({}, {
                    success: function() {
                        Backbone.trigger(self.masterComponent.componentId + '-' + 'post-usuario-save', {view: self, model : self.model});
                    },
                    error: function(error) {
                        Backbone.trigger(self.componentId + '-' + 'error', {event: 'usuario-master-save', view: self, error: error});
                    }
                });
			    if (this.postInit) {
					this.postInit();
				}
            });
        },
        render: function(domElementId){
			if (domElementId) {
				var rootElementId = $("#"+domElementId);
				this.masterElement = this.componentId + "-master";
				this.tabsElement = this.componentId + "-tabs";

				rootElementId.append("<div id='" + this.masterElement + "'></div>");
				rootElementId.append("<div id='" + this.tabsElement + "'></div>");
			}
			this.masterComponent.render(this.masterElement);
		},
		initializeChildComponents: function () {
			this.tabModel = new App.Model.TabModel({tabs: [
                {label: "Contacto Us", name: "contactoUs", enable: true},
                {label: "Eventos Us", name: "eventosUs", enable: true}
			]});
			this.tabs = new TabController({model: this.tabModel});

			this.contactoUsComponent = new contactoUsComponent();
            this.contactoUsComponent.initialize({cache: {data: [], mode: "memory"},pagination: false});
			this.childComponents.push(this.contactoUsComponent);

			this.eventosUsComponent = new eventosUsComponent();
            this.eventosUsComponent.initialize({cache: {data: [], mode: "memory"},pagination: false});
			this.childComponents.push(this.eventosUsComponent);

            var self = this;
            
            this.configToolbar(this.contactoUsComponent,false);
            this.contactoUsComponent.disableEdit();

            Backbone.on(this.contactoUsComponent.componentId + '-toolbar-add', function() {
                var selection = new SelectionController({"componentId":"contactoUsComponent"});
                App.Utils.getComponentList('usuarioComponent', function(componentName, model) {
                    if (model.models.length == 0) {
                        alert('There is no Contacto Uss to select.');
                    } else {
                        selection.showSelectionList({list: model, name: 'name', title: 'Contacto Us List'});
                    }
                    ;
                });
            });

            Backbone.on('contactoUsComponent-post-selection', function(models) {
            	self.contactoUsComponent.addRecords(models);
            	self.contactoUsComponent.render();
            });

            this.configToolbar(this.eventosUsComponent,false);
            this.eventosUsComponent.disableEdit();

            Backbone.on(this.eventosUsComponent.componentId + '-toolbar-add', function() {
                var selection = new SelectionController({"componentId":"eventosUsComponent"});
                App.Utils.getComponentList('eventoComponent', function(componentName, model) {
                    if (model.models.length == 0) {
                        alert('There is no Eventos Uss to select.');
                    } else {
                        selection.showSelectionList({list: model, name: 'name', title: 'Eventos Us List'});
                    }
                    ;
                });
            });

            Backbone.on('eventosUsComponent-post-selection', function(models) {
            	self.eventosUsComponent.addRecords(models);
            	self.eventosUsComponent.render();
            });

		},
        renderChilds: function(params) {
            var self = this;
            
            var options = {
                success: function() {
                	self.tabs.render(self.tabsElement);

					self.contactoUsComponent.clearCache();
					self.contactoUsComponent.setRecords(self.model.get('listcontactoUs'));
					self.contactoUsComponent.render(self.tabs.getTabHtmlId('contactoUs'));

					self.eventosUsComponent.clearCache();
					self.eventosUsComponent.setRecords(self.model.get('listeventosUs'));
					self.eventosUsComponent.render(self.tabs.getTabHtmlId('eventosUs'));

                    $('#'+self.tabsElement).show();
                },
                error: function() {
                    Backbone.trigger(self.componentId + '-' + 'error', {event: 'usuario-edit', view: self, id: id, data: data, error: error});
                }
            };
            if (params.id) {
                self.model = new App.Model.UsuarioMasterModel({id: params.id});
                self.model.fetch(options);
            } else {
                self.model = new App.Model.UsuarioMasterModel();
                options.success();
            }


        },
        showMaster: function (flag) {
			if (typeof (flag) === "boolean") {
				if (flag) {
					$("#"+this.masterElement).show();
				} else {
					$("#"+this.masterElement).hide();
				}
			}
		},
        hideChilds: function() {
            $("#"+this.tabsElement).hide();
        },
		configToolbar: function(component, composite) {
		    component.removeGlobalAction('refresh');
			component.removeGlobalAction('print');
			component.removeGlobalAction('search');
			if (!composite) {
				component.removeGlobalAction('create');
				component.removeGlobalAction('save');
				component.removeGlobalAction('cancel');
				component.addGlobalAction({
					name: 'add',
					icon: 'glyphicon-send',
					displayName: 'Add',
					show: true
				}, function () {
					Backbone.trigger(component.componentId + '-toolbar-add');
				});
			}
        },
        getChilds: function(name){
			for (var idx in this.childComponents) {
				if (this.childComponents[idx].name === name) {
					return this.childComponents[idx].getRecords();
				}
			}
		},
		setChilds: function(childName,childData){
			for (var idx in this.childComponents) {
				if (this.childComponents[idx].name === childName) {
					this.childComponents[idx].setRecords(childData);
				}
			}
		},
		renderMaster: function(domElementId){
			this.masterComponent.render(domElementId);
		},
		renderChild: function(childName, domElementId){
			for (var idx in this.childComponents) {
				if (this.childComponents[idx].name === childName) {
					this.childComponents[idx].render(domElementId);
				}
			}
		}
    });

    return App.Component._UsuarioMasterComponent;
});