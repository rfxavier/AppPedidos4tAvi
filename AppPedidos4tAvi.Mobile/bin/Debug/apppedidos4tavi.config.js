// NOTE object below must be a valid JSON
// DEIXAR o config.navigation[0] SEMPRE como view de Início (reservado)
// DEIXAR o config.navigation[último] SEMPRE como view de Sair = fazer logoff (reservado)
window.AppPedidos4tAvi = $.extend(true, window.AppPedidos4tAvi, {
    "config": {
        "layoutSet": "slideout",
        "animationSet": "default",
        "navigation": [
            {
                "title": "Início",
                "onExecute": "#inicio",
                "icon": "home"
            },
            {
                "title": "Pedidos",
                "onExecute": function () {
                    var uri = AppPedidos4tAvi.app.router.format({
                        view: 'pedidos',
                        id: {
                            codVendedor: db.userInfo.codigoVendedor,
                            utilizaCota: db.userInfo.utilizaCota,
                            codSubVendedor: db.userInfo.codigoSubVendedor
                        }
                    });
                    AppPedidos4tAvi.app.navigate(uri);

                },
                "icon": "spinnext",
                "visible" : false
            },
            {
                "title": "Liberação",
                "onExecute": function () {
                    var uri = AppPedidos4tAvi.app.router.format({
                        view: 'liberacao',
                        id: {
                            codAprovador: db.userInfo.codigoAprovador
                        }
                    });
                    AppPedidos4tAvi.app.navigate(uri);

                },
                "icon": "spinnext",
                "visible": false
            },
            {
                "title": "Relatórios",
                "onExecute": function () {
                    var uri = AppPedidos4tAvi.app.router.format({
                        view: 'relatorios',
                        id: {
                            codAprovador: db.userInfo.codigoAprovador
                        }
                    });
                    AppPedidos4tAvi.app.navigate(uri);

                },
                "icon": "spinnext",
                "visible": false
            },
            {
                "title": "Sobre",
                "onExecute": "#About",
                "icon": "info"
            },
            {
                "title": "Sair",
                "onExecute": function () { db.logout(); },
                "icon": "clear"
            }
        ],
        "offlineCache" : false
    }
});
