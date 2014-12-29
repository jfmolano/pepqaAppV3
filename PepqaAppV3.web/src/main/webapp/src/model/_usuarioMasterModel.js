define([], function() {
    App.Model._UsuarioMasterModel = Backbone.Model.extend({
     	initialize: function() {
            this.on('invalid', function(model,error) {
                Backbone.trigger('usuario-master-model-error', error);
            });
        },
        validate: function(attrs, options){
        	var modelMaster = new App.Model.UsuarioModel();
        	if(modelMaster.validate){
            	return modelMaster.validate(attrs.usuarioEntity,options);
            }
        }
    });

    App.Model._UsuarioMasterList = Backbone.Collection.extend({
        model: App.Model._UsuarioMasterModel,
        initialize: function() {
        }

    });
    return App.Model._UsuarioMasterModel;
    
});