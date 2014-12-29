define(['model/_pepqaAppMasterModel'], function() { 
    App.Model.PepqaAppMasterModel = App.Model._PepqaAppMasterModel.extend({

    });

    App.Model.PepqaAppMasterList = App.Model._PepqaAppMasterList.extend({
        model: App.Model.PepqaAppMasterModel
    });

    return  App.Model.PepqaAppMasterModel;

});