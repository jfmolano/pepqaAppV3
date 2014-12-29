define(['controller/selectionController', 'model/cacheModel', 'model/pepqaAppMasterModel', 'component/_CRUDComponent', 'controller/tabController', 'component/pepqaAppComponent',
 'component/usuarioComponent', 'component/eventoComponent'],
 function(SelectionController, CacheModel, PepqaAppMasterModel, CRUDComponent, TabController, PepqaAppComponent,
 usuariosComponent, eventosComponent) {
    App.Component._PepqaAppMasterComponent = App.Component.BasicComponent.extend({
        initialize: function() {
            var self = this;
            this.configuration = App.Utils.loadComponentConfiguration('pepqaAppMaster');
            App.Model.PepqaAppMasterModel.prototype.urlRoot = this.configuration.context;
            this.componentId = App.Utils.randomInteger();
            
            this.masterComponent = new PepqaAppComponent();
            this.masterComponent.initialize();
            
            this.childComponents = [];
			
			this.initializeChildComponents();
            
            Backbone.on(this.masterComponent.componentId + '-post-pepqaApp-create', function(params) {
                self.renderChilds(params);
            });
            Backbone.on(this.masterComponent.componentId + '-post-pepqaApp-edit', function(params) {
                self.renderChilds(params);
            });
            Backbone.on(this.masterComponent.componentId + '-pre-pepqaApp-list', function() {
                self.hideChilds();
            });
            Backbone.on('pepqaApp-master-model-error', function(error) {
                Backbone.trigger(uComponent.componentId + '-' + 'error', {event: 'pepqaApp-master-save', view: self, message: error});
            });
            Backbone.on(this.masterComponent.componentId + '-instead-pepqaApp-save', function(params) {
                self.model.set('pepqaAppEntity', params.model);
                if (params.model) {
                    self.model.set('id', params.model.id);
                } else {
                    self.model.unset('id');
                }

				App.Utils.fillCacheList(
					'usuarios',
					self.model,
					self.usuariosComponent.getDeletedRecords(),
					self.usuariosComponent.getUpdatedRecords(),
					self.usuariosComponent.getCreatedRecords()
				);

				App.Utils.fillCacheList(
					'eventos',
					self.model,
					self.eventosComponent.getDeletedRecords(),
					self.eventosComponent.getUpdatedRecords(),
					self.eventosComponent.getCreatedRecords()
				);

                self.model.save({}, {
                    success: function() {
                        Backbone.trigger(self.masterComponent.componentId + '-' + 'post-pepqaApp-save', {view: self, model : self.model});
                    },
                    error: function(error) {
                        Backbone.trigger(self.componentId + '-' + 'error', {event: 'pepqaApp-master-save', view: self, error: error});
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
                {label: "Usuarios", name: "usuarios", enable: true},
                {label: "Eventos", name: "eventos", enable: true}
			]});
			this.tabs = new TabController({model: this.tabModel});

			this.usuariosComponent = new usuariosComponent();
            this.usuariosComponent.initialize({cache: {data: [], mode: "memory"},pagination: false});
			this.childComponents.push(this.usuariosComponent);

			this.eventosComponent = new eventosComponent();
            this.eventosComponent.initialize({cache: {data: [], mode: "memory"},pagination: false});
			this.childComponents.push(this.eventosComponent);

            var self = this;
            
            this.configToolbar(this.usuariosComponent,true);
            Backbone.on(self.usuariosComponent.componentId + '-post-usuario-create', function(params) {
                params.view.currentModel.setCacheList(params.view.currentList);
            });
            
            this.configToolbar(this.eventosComponent,true);
            Backbone.on(self.eventosComponent.componentId + '-post-evento-create', function(params) {
                params.view.currentModel.setCacheList(params.view.currentList);
            });
            
		},
        renderChilds: function(params) {
            var self = this;
            
            var options = {
                success: function() {
                	self.tabs.render(self.tabsElement);

					self.usuariosComponent.clearCache();
					self.usuariosComponent.setRecords(self.model.get('listusuarios'));
					self.usuariosComponent.render(self.tabs.getTabHtmlId('usuarios'));

					self.eventosComponent.clearCache();
					self.eventosComponent.setRecords(self.model.get('listeventos'));
					self.eventosComponent.render(self.tabs.getTabHtmlId('eventos'));

                    $('#'+self.tabsElement).show();
                },
                error: function() {
                    Backbone.trigger(self.componentId + '-' + 'error', {event: 'pepqaApp-edit', view: self, id: id, data: data, error: error});
                }
            };
            if (params.id) {
                self.model = new App.Model.PepqaAppMasterModel({id: params.id});
                self.model.fetch(options);
            } else {
                self.model = new App.Model.PepqaAppMasterModel();
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

    return App.Component._PepqaAppMasterComponent;
});