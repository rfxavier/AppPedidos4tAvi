/// <reference path="../js/jquery-1.11.3.min.js" />
/// <reference path="../js/knockout-3.4.0.js" />
/// <reference path="../js/dx.all.js" />

(function() {
	var isWinJS = "WinJS" in window;
    var endpointSelector = new DevExpress.EndpointSelector(AppPedidos4tAvi.config.endpoints);
    var serviceConfig = $.extend(true, {}, AppPedidos4tAvi.config.services, {
        db: {
            url: endpointSelector.urlFor("db"),

            // To enable JSONP support, uncomment the following line
            //jsonp: !isWinJS,

            // To allow cookies and HTTP authentication with CORS, uncomment the following line
            // withCredentials: true,

            errorHandler: handleServiceError
        }
    });

    function handleServiceError(error) {
        if(isWinJS) {
            try {
                new Windows.UI.Popups.MessageDialog(error.message).showAsync();
            } catch(e) {
                // Another dialog is shown
            }
        } else {
            alert(error.message);
        }
    }

    // Enable partial CORS support for IE < 10    
    $.support.cors = true;
    
    //AppPedidos4tAvi.db = new DevExpress.data.ODataContext(serviceConfig.db);

    function createWebAPIClient(applicationObj, serviceUrl) {
        var actionEvents = {
            signinAction: function (args, sender) {
                applicationObj.app.navigate('login', { root: true });
                DevExpress.ui.notify('O servidor requer login', 'error', 3000);
            },
            authenticatedAction: function (args, sender) {
                DevExpress.ui.notify('Login efetuado com sucesso!', 'success', 3000);
                applicationObj.app.navigate('inicio', { root: true });
            },
            externalAuthenticatedAction: function (args, sender) {
                DevExpress.ui.notify('Você fez login com sucesso!', 'success', 3000);
                applicationObj.app.navigate('inicio', { root: true });
            },
            externalRegisteredAction: function (args, sender) {
                DevExpress.ui.notify('Sua conta externa foi registrada!', 'success', 3000);
            },
            externalRegisterErrorAction: function (args, sender) {
                DevExpress.ui.notify('Registro falhou', 'error', 3000);
            },
            providersPopulatedAction: function (args, sender) {
                sender.loginProviders = ko.observableArray(sender.loginProviders);
                sender.hasProviders = ko.observable(args.length > 0);
            },
            logoutAction: function (args, sender) {
                //Desabilita dinamicamente todos os itens de navegação
                //Desde o SEGUNDO até O ANTE PENÚLTIMO
                //AppPedidos4tAvi.app.navigation[0] = reservado para view Início
                //AppPedidos4tAvi.app.navigation[AppPedidos4tAvi.app.navigation.length - 2] - reservado para Sobre
                //AppPedidos4tAvi.app.navigation[AppPedidos4tAvi.app.navigation.length - 1] - reservado para Sair = Logout()
                for (var i = 1; i < AppPedidos4tAvi.app.navigation.length - 2; i++) {
                    AppPedidos4tAvi.app.navigation[i].option('visible', false);
                };

                applicationObj.app.navigate('login', { root: true });
            }
        };

        var result = new DX.WebAPI.Client(serviceUrl, actionEvents);
        result.owner = applicationObj;
        /* Fetch the login providers from server and set correct redirectUrl */
        result.populateProviders();
        // Estende o objeto db com as Datasources utilizadas
        result.registerDatasource({ apiName: 'UsuarioAppPedidos', apiController: 'UsuarioAppPedidos'/*, apiListAction: '', apiByKeyAction: '', apiInsertAction: '', apiUpdateAction: '', apiRemoveAction: ''*/ });
        result.registerDatasource({ apiName: 'Cliente', apiController: 'Cliente'/*, apiListAction: '', apiByKeyAction: '', apiInsertAction: '', apiUpdateAction: '', apiRemoveAction: ''*/ });
        result.registerDatasource({ apiName: 'Produto', apiController: 'Produto'/*, apiListAction: '', apiByKeyAction: '', apiInsertAction: '', apiUpdateAction: '', apiRemoveAction: ''*/ });
        result.registerDatasource({ apiName: 'Pedido', apiController: 'Pedido'/*, apiListAction: '', apiByKeyAction: '', apiInsertAction: '', apiUpdateAction: '', apiRemoveAction: ''*/ });
        result.registerDatasource({ apiName: 'PedidoSubstTrib', apiController: 'PedidoSubstTrib'/*, apiListAction: '', apiByKeyAction: '', apiInsertAction: '', apiUpdateAction: '', apiRemoveAction: ''*/ });
        result.registerDatasource({ apiName: 'PedidoCompra', apiController: 'PedidoCompra'/*, apiListAction: '', apiByKeyAction: '', apiInsertAction: '', apiUpdateAction: '', apiRemoveAction: ''*/ });
        result.registerDatasource({ apiName: 'PedidoCompraItem', apiController: 'PedidoCompraItem'/*, apiListAction: '', apiByKeyAction: '', apiInsertAction: '', apiUpdateAction: '', apiRemoveAction: ''*/ });

        return result;
    }
    window.db = createWebAPIClient(AppPedidos4tAvi, serviceConfig.db.url);

    var _pedido4tHeader = {
        _ped4tHeader: new DevExpress.data.LocalStore({
            key: "id",
            name: "ped4tHeader",
            immediate: true
        })
    };

    $.extend(window.db.data, _pedido4tHeader);

    var _pedido4tItems = {
        _ped4tItems: new DevExpress.data.LocalStore({
            key: "B1_COD",
            name: "ped4tItems",
            immediate: true
        })
    };

    $.extend(window.db.data, _pedido4tItems);

    var _pedidoCompra4tItems = {
        _pedCompra4tItems: new DevExpress.data.LocalStore({
            key: ["USER", "EMPRESA", "CR_FILIAL", "C7_NUM"],
            name: "pedCompra4tItems",
            immediate: true
        })
    };

    $.extend(window.db.data, _pedidoCompra4tItems);
}());
