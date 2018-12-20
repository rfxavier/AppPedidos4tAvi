AppPedidos4tAvi.liberacaoDetalhe = function (params) {
    "use strict";
    var infoIsReady = $.Deferred();

    var formData = ko.observable({}),
        pedidoDetalheArray = ko.observableArray([]);

    function viewShownEvent() {
        //params deve chegar aqui nessa view com a seguinte estrutura:
        //id: {
        //        codAprovador: '',
        //        empresa: '99',
        //        codFilial: '999',
        //        numPedido: '999999',
        //        codFornecedor: '999999',
        //        codLoja: '99',
        //        nomeFornecedor: 'XXXXX',
        //        dataEmissao: '99/99/9999',
        //        valorTotal: '9.999,99'
        //        quemIncluiu: 'XXXXXX',
        //        obs: 'XXXXXXX'
        //}

        formData({
            "Pedido": params.id.numPedido,
            "Valor": params.id.valorTotal,
            "Fornecedor": params.id.nomeFornecedor + ' ' + params.id.codFornecedor + ' Lj:' + params.id.codLoja,
            "QuemIncluiu": params.id.quemIncluiu,
            "Observação": params.id.obs
        });
        //console.log(params.id.nomeFornecedor);

        db.data.PedidoCompraItem.Datasource.filter([["EMPRESA", "=", params.id.empresa], "and", ["C7_FILIAL", "=", params.id.codFilial], "and", ["C7_NUM", "=", params.id.numPedido]]);
        
        db.data.PedidoCompraItem.Datasource.load()
            .done(function (data) {
                //console.log(data);
                pedidoDetalheArray([]);

                for (var i = 0; i < data.length; i++) {
                    //coloca novas propriedades no array, que não são entregues pelo backend

                    var C7_QUANT_DISP,
                        C7_TOTAL_DISP;

                    C7_QUANT_DISP = data[i].C7_QUANT.formatMoney(0, ',', '.');
                    C7_TOTAL_DISP = data[i].C7_TOTAL.formatMoney(2, ',', '.');

                    $.extend(data[i], {
                        C7_QUANT_DISP: C7_QUANT_DISP,
                        C7_TOTAL_DISP: C7_TOTAL_DISP
                    });

                    pedidoDetalheArray.push(data[i]);
                };

                infoIsReady.resolve();
            });



    };

    var viewModel = {
        viewShown: viewShownEvent,
        formOptions: {
            formData: formData,
            readOnly: true,
            showColonAfterLabel: true,
            labelLocation: 'top',
            colCount: 2,
            minColWidth: 50,
            colCountByScreen: {
                xs: 2
            },
            items: [ {
                dataField: "Pedido",
                cssClass: "s4t-inputdisabled"
            }, {
                colSpan: 2,
                dataField: "Valor",
                cssClass: "s4t-inputdisabled"
            }, {
                colSpan: 2,
                dataField: "Fornecedor",
                editorType: "dxTextArea",
                editorOptions: {
                    height: 'auto'
                },
                cssClass: "s4t-inputdisabled"
            }, {
                colSpan: 2,
                dataField: "QuemIncluiu",
                editorType: "dxTextArea",
                editorOptions: {
                    height: 'auto'
                },
                cssClass: "s4t-inputdisabled",

            }, {
                colSpan: 2,
                dataField: "Observação",
                editorType: "dxTextArea",
                editorOptions: {
                    height: 'auto'
                },
                cssClass: "s4t-inputdisabled"
            }
            

            ]
        },
        pedidoDetalheArray: pedidoDetalheArray,
        valorTotal: params.id.valorTotal,
        codAprovador: params.id.codAprovador,
        empresa: params.id.empresa,
        codFilial: params.id.codFilial,
        numPedido: params.id.numPedido,
        flgOperacao: ko.observable(''),
        loadingVisible: ko.observable(false),
        loadpanelMessage: ko.observable('Carregando...')
    };

    viewModel.loadOptions = {
        visible: viewModel.loadingVisible,
        message: viewModel.loadpanelMessage,
        closeOnOutsideClick: false
    };

    viewModel.pedidoCompraObjectPayload = ko.computed(function () {
        return {
            codAprovador: viewModel.codAprovador,
            flgOperacao: viewModel.flgOperacao(),
            pedidos: [
                {
                empresa: viewModel.empresa,
                codFilial: viewModel.codFilial,
                numPedido: viewModel.numPedido
                }
            ]
        };
    });

    viewModel.navbar = {
        items: [
        { text: "Liberar este pedido", icon: "check" },
        { text: "Bloquear este pedido", icon: "clear" }
        ],
        selectedIndex: ko.observable(-1)
    };

    function processaOperacao(flgOperacao) {
        var textoConfirma;

        switch (flgOperacao) {
            case 'L':
                textoConfirma = 'Confirma liberação deste pedido ?'

                break;
            case 'B':
                textoConfirma = 'Confirma bloqueio deste pedido ?'

                break;
        };

        var customDialog = DevExpress.ui.dialog.custom({
            title: "Confirmar",
            message: textoConfirma,
            toolbarItems: [
                { text: "Sim", onClick: function () { return true; } },
                { text: "Não", onClick: function () { return false; } }
            ]
        });

        customDialog.show().done(function (dialogResult) {
            if (dialogResult) {
                viewModel.loadpanelMessage('Enviando Informações');
                viewModel.loadingVisible(true);

                viewModel.flgOperacao(flgOperacao);

                db.data.PedidoCompra.insert(viewModel.pedidoCompraObjectPayload())
                    .done(function (data) {
                        //Inserção ocorreu com sucesso

                        console.log(data);

                        viewModel.loadingVisible(false);
                        viewModel.navbar.selectedIndex(-1);

                        AppPedidos4tAvi.app.currentViewModel = null;
                        AppPedidos4tAvi.app.back();

                        //ui.notify
                    });
            };
        });
    };

    viewModel.navbarOptions = {
        items: viewModel.navbar.items,
        selectedIndex: viewModel.navbar.selectedIndex,
        onItemClick: function (e) {
            if (e.itemIndex == 0) {
                //Entrou na opção de liberação

                processaOperacao('L');

            } else if (e.itemIndex == 1) {
                //Entrou opção de bloqueio

                processaOperacao('B');
            };
        }
    };


    return viewModel;
};