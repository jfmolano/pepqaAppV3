define(['model/_usuarioMasterModel'], function() { 
    App.Model.UsuarioMasterModel = App.Model._UsuarioMasterModel.extend({

    });

    App.Model.UsuarioMasterList = App.Model._UsuarioMasterList.extend({
        model: App.Model.UsuarioMasterModel
    });

    return  App.Model.UsuarioMasterModel;

});