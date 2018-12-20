AppPedidos4tAvi.relArgCliente = function (params) {
    var infoIsReady = $.Deferred();

    var datasourceClientes = new DevExpress.data.DataSource({
        store: []
    });

    var searchOptionsValue = ko.observable('');

    function viewShownEvent() {
        db.data.Cliente.Datasource.filter("A1_VEND", "=", db.userInfo.codigoVendedor);

        db.data.Cliente.Datasource.load()
            .done(function (data) {
                datasourceClientes.store().clear();

                for (var i = 0; i < data.length; i++) {
                    var lojaDisp,
                        cnpjDisp;

                    lojaDisp = 'LOJA ' + data[i].A1_LOJA;
                    cnpjDisp = data[i].A1_CGC.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")

                    datasourceClientes.store().insert($.extend(data[i], {
                        A1_LOJA_DISP: lojaDisp,
                        A1_CGC_DISP: cnpjDisp
                    }));
                };

                datasourceClientes.paginate(false);
                datasourceClientes.load();
                infoIsReady.resolve();

            });
    };

    var viewModel = {
        infoIsReady: infoIsReady.promise(),
        viewShown: viewShownEvent,
        codVendedor: params.id.codVendedor,
        pivotData: [
            {
                title: "Nome",
                listClientesOptions: {
                    dataSource: datasourceClientes,
                    itemTemplate: "nome",
                    noDataText: 'Não há informações disponíveis'
                },
                searchOptions: {
                    valueChangeEvent: "keyup",
                    placeholder: "Pesquisar Nome",
                    mode: "search",
                    value: searchOptionsValue,
                    onValueChanged: function (args) {

                        if (args.value.length > 2 || args.value.length == 0) {
                            viewModel.loadingVisible(true);

                            datasourceClientes.searchOperation("contains");
                            datasourceClientes.searchExpr("A1_NOME");
                            datasourceClientes.searchValue(args.value);
                            datasourceClientes.load().done(function () {
                                viewModel.loadingVisible(false);
                            });
                        }
                    }
                }
            },
            {
                title: "Código",
                listClientesOptions: {
                    dataSource: datasourceClientes,
                    itemTemplate: "codigo",
                    noDataText: 'Não há informações disponíveis'
                },
                searchOptions: {
                    valueChangeEvent: "keyup",
                    placeholder: "Pesquisar Código",
                    mode: "search",
                    value: searchOptionsValue,
                    onValueChanged: function (args) {
                        viewModel.loadingVisible(true);

                        datasourceClientes.searchOperation("startswith");
                        datasourceClientes.searchExpr("A1_COD");
                        datasourceClientes.searchValue(args.value);
                        datasourceClientes.load().done(function () {
                            viewModel.loadingVisible(false);
                        });;
                    }
                }
            },
            {
                title: "CNPJ",
                listClientesOptions: {
                    dataSource: datasourceClientes,
                    itemTemplate: "cnpj",
                    noDataText: 'Não há informações disponíveis'
                },
                searchOptions: {
                    valueChangeEvent: "keyup",
                    placeholder: "Pesquisar CNPJ",
                    mode: "search",
                    value: searchOptionsValue,
                    onValueChanged: function (args) {
                        viewModel.loadingVisible(true);

                        datasourceClientes.searchOperation("startswith");
                        datasourceClientes.searchExpr("A1_CGC");
                        datasourceClientes.searchValue(args.value);
                        datasourceClientes.load().done(function () {
                            viewModel.loadingVisible(false);
                        });;
                    }
                }
            },
            {
                title: "Endereço",
                listClientesOptions: {
                    dataSource: datasourceClientes,
                    itemTemplate: "endereco",
                    noDataText: 'Não há informações disponíveis'
                },
                searchOptions: {
                    valueChangeEvent: "keyup",
                    placeholder: "Pesquisar Endereço",
                    mode: "search",
                    value: searchOptionsValue,
                    onValueChanged: function (args) {
                        if (args.value.length > 2 || args.value.length == 0) {
                            viewModel.loadingVisible(true);

                            datasourceClientes.searchOperation("contains");
                            datasourceClientes.searchExpr("A1_END");
                            datasourceClientes.searchValue(args.value);
                            datasourceClientes.load().done(function () {
                                viewModel.loadingVisible(false);
                            });;
                        }
                    }
                }
            }
        ],
        onClienteClick: function (e) {
            var navToView = 'relArgClienteDiaInicial';

            if (params.id.relNome == 'relTitulosVendCli') {
                navToView = 'relArgClientePeriodoEmissaoVencimento';
            };

            var uri = AppPedidos4tAvi.app.router.format({
                view: navToView,
                id: {
                    relNome: params.id.relNome, //'relVendasVendCli',
                    codVendedor: params.id.codVendedor,
                    utilizaCota: params.id.utilizaCota,
                    codSubVendedor: params.id.codSubVendedor,
                    codCliente: e.model.A1_COD,
                    nomeCliente: e.model.A1_NOME,
                    endCliente: e.model.A1_END,
                    codLoja: e.model.A1_LOJA
                }
            });
            AppPedidos4tAvi.app.navigate(uri);
        },
        loadingVisible: ko.observable(false)
    };

    viewModel.loadOptions = {
        visible: viewModel.loadingVisible,
        message: 'Carregando...',
        closeOnOutsideClick: false
    };

    viewModel.pivotOptions = {
        dataSource: viewModel.pivotData,
        selectedIndex: ko.observable(0),
        onSelectionChanged: function (e) {
            searchOptionsValue('');
        },
        onContentReady: function (e) {
            $(".dx-empty-message").text(null);
        },
        itemTitleTemplate: 'customTitleTemplate'
    };

    return viewModel;
};