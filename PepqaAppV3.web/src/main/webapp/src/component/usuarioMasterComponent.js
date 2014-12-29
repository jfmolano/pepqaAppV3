define(['component/_usuarioMasterComponent'],function(_UsuarioMasterComponent) {
    App.Component.UsuarioMasterComponent = _UsuarioMasterComponent.extend({
		postInit: function(){
			//Escribir en este servicio las instrucciones que desea ejecutar al inicializar el componente
		}
    });

    return App.Component.UsuarioMasterComponent;
});