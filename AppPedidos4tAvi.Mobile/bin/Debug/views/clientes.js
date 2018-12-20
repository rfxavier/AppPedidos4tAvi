AppPedidos4tAvi.clientes = function (params) {
    var infoIsReady = $.Deferred();

    var datasourceClientes = new DevExpress.data.DataSource({
        store: []
    });

    var searchOptionsValue = ko.observable('');

    function viewShownEvent() {
        db.data.Cliente.Datasource.filter("A1_VEND", "=", params.id.codVendedor);

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

        //Restauração de estado do app
        //Última aba do dxPivot acessada
        viewModel.pivotOptions.selectedIndex(0 || getUltimoItemPivotData());
        
        if (getUltimoConteudoPesquisaCliente() || '' !== '') {
            //Se existe um último conteúdo do dxTextBox searchOptions inputado
            //Seta esse conteúdo
            searchOptionsValue(getUltimoConteudoPesquisaCliente());

            //Forçadamente dispara o onValueChanged para executar a filtragem na datasource (devido ao fato de que changeEvent = keyup)
            viewModel.pivotData[viewModel.pivotOptions.selectedIndex() || 0].searchOptions.onValueChanged({ value: getUltimoConteudoPesquisaCliente() });
        };

    };

    function setUltimoItemPivotData(index) {
        window.localStorage.setItem("app4tUltimoItemPivotData", index);
    };

    function getUltimoItemPivotData() {
        return window.localStorage.getItem("app4tUltimoItemPivotData");
    };

    function setUltimoConteudoPesquisaCliente(string) {
        window.localStorage.setItem("app4tUltimoConteudoPesquisaCliente", string);
    };

    function getUltimoConteudoPesquisaCliente() {
        return window.localStorage.getItem("app4tUltimoConteudoPesquisaCliente");
    };

    function getPivotSelectedIndexFromTitle(title) {
        var index = 0;

        for (var i = 0; i < viewModel.pivotData.length; i++) {
            if (viewModel.pivotData && viewModel.pivotData[i] && viewModel.pivotData[i].title) {
                if (viewModel.pivotData[i].title == title) {
                    index = i;
                };
            };
        };

        return index;
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
                        //console.log(viewModel.loadingVisible());

                        datasourceClientes.searchOperation("contains");
                        datasourceClientes.searchExpr("A1_NOME");
                        datasourceClientes.searchValue(args.value);
                        datasourceClientes.load().done(function () {
                            viewModel.loadingVisible(false);
                            //console.log(viewModel.loadingVisible());
                        });

                        setUltimoConteudoPesquisaCliente(args.value);
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
                        //console.log(viewModel.loadingVisible());
                    });;

                    setUltimoConteudoPesquisaCliente(args.value);
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
                        //console.log(viewModel.loadingVisible());
                    });;

                    setUltimoConteudoPesquisaCliente(args.value);
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
                            //console.log(viewModel.loadingVisible());
                        });;

                        setUltimoConteudoPesquisaCliente(args.value);
                    }
                }
            }
        }
        ],
        onClienteClick: function (e) {
            var navToView = '';

            if (params.id.navToView == 'periodoPedidos') {
                //Se o destino em params.id.navToView indica ir para periodoPedidos, coloca o navToView para ir para pedidos

                navToView = 'pedidos';
            } else if (params.id.navToView == 'pedidoDetalhe') {
                //Se o destino em params.id.navToView indica ir para pedidoDetalhe, coloca o navToView para ir para inicio (navToview não está sendo usada em pedidoDetalhe)
                navToView = 'inicio';
            };

            var uri = AppPedidos4tAvi.app.router.format({
                view: params.id.navToView,
                id: {
                    codVendedor: params.id.codVendedor,
                    utilizaCota: params.id.utilizaCota,
                    codSubVendedor: params.id.codSubVendedor,
                    codCliente: e.model.A1_COD,
                    nomeCliente: e.model.A1_NOME,
                    endCliente: e.model.A1_END,
                    cnpjCliente: e.model.A1_CGC_DISP,
                    codLoja: e.model.A1_LOJA,
                    navToView: navToView,
                    tipoOperacao: params.id.tipoOperacao,
                    numeroPedido: 0
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
            //console.log(e.addedItems[0]);
            //console.log(getPivotSelectedIndexFromTitle(e.addedItems[0].title));
            setUltimoItemPivotData(getPivotSelectedIndexFromTitle(e.addedItems[0].title));
            searchOptionsValue('');
            setUltimoConteudoPesquisaCliente('');
        },
        onContentReady: function (e) {
            $(".dx-empty-message").text(null)
        },
        itemTitleTemplate: 'customTitleTemplate'
    };

    return viewModel;
};