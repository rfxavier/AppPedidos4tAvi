AppPedidos4tAvi.relatorios = function (params) {
    "use strict";

    var datasourceRelatorios = new DevExpress.data.DataSource({
        store: []
    });

    function viewShownEvent() {
        console.log(db.userInfo);

        datasourceRelatorios.store().clear();

        for (var i = 0; i < db.userInfo.listaRelatorios.length; i++) {
            datasourceRelatorios.store().insert(db.userInfo.listaRelatorios[i]);
        };

        datasourceRelatorios.paginate(false);
        datasourceRelatorios.load();
    };

    var viewModel = {
        viewShown: viewShownEvent,
        callbacks: {},
        listOptions: {
            dataSource: datasourceRelatorios,
            itemTemplate: 'item',
            noDataText: 'Não há informações disponíveis',
            pageLoadingText: 'Carregando...',
            onItemClick: function (e) {
                var uri = AppPedidos4tAvi.app.router.format({
                    view: e.itemData.nomeFormArgumento,
                    id: {
                        viewTitle: e.itemData.tituloRelatorio,
                        relNome: e.itemData.nomeRelatorio
                    }
                });

                AppPedidos4tAvi.app.navigate(uri);
            }
        }
    };
    return viewModel;
};