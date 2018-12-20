AppPedidos4tAvi.liberacao = function (params) {
    "use strict";
    var infoIsReady = $.Deferred();

    var accordionInstance = null;

    var datasourcePedidosCompra = new DevExpress.data.DataSource({
        store: new DevExpress.data.ArrayStore({
            key: "id",
            data: []
        })
    });

    var selectedItemKeys = ko.observable([]),
        arrayPedidosCompra = [],
        mappedArrayPedidosCompra = ko.observableArray([]),
        dataSourceAccordion = ko.observableArray([]);

    var pedidoCompraGrupos = function (data) {
        var self = this;

        self.EMPRESA = data.EMPRESA;
        self.EMPRESA_NOME = data.EMPRESA_NOME;

        self.items = ko.observableArray($.map(data.items, function (item) {
            return new pedidoCompraItems(item);
        }));

        self.totalGrupo = ko.computed(function () {
            var sum = 0;
            ko.utils.arrayForEach(self.items(), function (item) {
                sum += item.CR_TOTAL;
            })
            return sum;
        });

        self.totalGrupoDisp = ko.computed(function () {
            return self.totalGrupo().formatMoney(2, ',', '.');
        });

        self.totalGrupoDispReais = ko.computed(function () {
            return "R$ " + self.totalGrupo().formatMoney(2, ',', '.');
        });
    };

    var pedidoCompraItems = function (data) {
        var self = this;

        self.EMPRESA = data.EMPRESA;
        self.CR_FILIAL = data.CR_FILIAL;
        self.C7_NUM = data.C7_NUM;
        self.C7_FORNECE = data.C7_FORNECE;
        self.C7_LOJA = data.C7_LOJA;
        self.A2_NOME = data.A2_NOME;
        self.CR_EMISSAO = data.CR_EMISSAO;
        self.CR_TOTAL = data.CR_TOTAL;
        self.C7_ZZINCNO = data.C7_ZZINCNO;
        self.OBS = data.OBS;
        self.SEL = ko.observable(false);
        self.isSELTODOS = data.isSELTODOS;

        self.CR_TOTAL_DISP = data.CR_TOTAL_DISP;
        self.CR_TOTAL_DISP_REAIS = data.CR_TOTAL_DISP_REAIS;

        //self.CR_TOTAL_DISP = ko.computed(function () {
        //    return self.CR_TOTAL.formatMoney(2, ',', '.');
        //});

        //self.CR_TOTAL_DISP_REAIS = ko.computed(function () {
        //    return "R$ " + self.CR_TOTAL.formatMoney(2, ',', '.');
        //});

        //tratamento subscribe SEL observable
        self.SEL.subscribe(function (newValue) {
            if (self.CR_FILIAL + self.C7_NUM !== '00000000') {
                //Se não for o checkbox de selecionar todos

                if (newValue) {
                    //console.log('INSERT SEL');

                    db.data._pedCompra4tItems.insert({ USER: params.id.codAprovador, EMPRESA: self.EMPRESA, CR_FILIAL: self.CR_FILIAL, C7_NUM: self.C7_NUM })
                        .fail(function (error) {
                            //console.log(error.message);
                        });
                } else {
                    //console.log('REMOVE SEL');

                    db.data._pedCompra4tItems.remove({ USER: params.id.codAprovador, EMPRESA: self.EMPRESA, CR_FILIAL: self.CR_FILIAL, C7_NUM: self.C7_NUM });
                };
            };
        });
    };

    var pedidoCompraResumoObjectAux = function () {
        var arrayResumo = [];

        for (var i = 0; i < dataSourceAccordion().length; i++) {
            var auxEMPRESA = dataSourceAccordion()[i].EMPRESA;

            for (var j = 0; j < dataSourceAccordion()[i].items().length; j++) {
                if (dataSourceAccordion()[i].items()[j].SEL() && dataSourceAccordion()[i].items()[j].CR_FILIAL + dataSourceAccordion()[i].items()[j].C7_NUM !== '00000000') {
                    //Está selecionado, vai fazer parte do arrayResumo
                    arrayResumo.push({
                        EMPRESA: auxEMPRESA,
                        CR_FILIAL: dataSourceAccordion()[i].items()[j].CR_FILIAL,
                        C7_NUM: dataSourceAccordion()[i].items()[j].C7_NUM
                    });
                };
            }
        }

        return {
            arrayResumo: arrayResumo
        }
    };

    var selecionaTodosPorEmpresa = function(empresa, SEL) {
        for (var i = 0; i < dataSourceAccordion().length; i++) {
            for (var j = 0; j < dataSourceAccordion()[i].items().length; j++) {
                if (dataSourceAccordion()[i].items()[j].EMPRESA == empresa) {
                    dataSourceAccordion()[i].items()[j].SEL(SEL);
                };
            }
        }
    };

    var desmarcaSelecionarTodos = function () {
        for (var i = 0; i < dataSourceAccordion().length; i++) {
            for (var j = 0; j < dataSourceAccordion()[i].items().length; j++) {
                if (dataSourceAccordion()[i].items()[j].CR_FILIAL + dataSourceAccordion()[i].items()[j].C7_NUM == '00000000' && dataSourceAccordion()[i].items()[j].SEL()) {
                    dataSourceAccordion()[i].items()[j].SEL(false);
                };
            }
        }
    };


    function viewShownEvent() {
        //console.log(infoIsReady.state());

        //array com propriedades "plain", para receber modelo do backend 
        arrayPedidosCompra = [];

        db.data.PedidoCompra.Datasource.group({ field: "EMPRESA" });
        db.data.PedidoCompra.Datasource.filter("CR_USER", "=", params.id.codAprovador);

        db.data.PedidoCompra.Datasource.load()
            .done(function (data) {
                //console.log(data);
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < data[i].items.length; j++) {

                        if (j == 0) {

                            //Insere elemento que representa "Selecionar Todos"
                            data[i].items.unshift({
                                EMPRESA: data[i].EMPRESA,
                                CR_FILIAL: '00',
                                C7_NUM: '000000',
                                C7_ZZINCNO: '',
                                C7_FORNECE: '',
                                C7_LOJA: '00',
                                A2_NOME: 'Selecionar Todos',
                                CR_EMISSAO: new Date(),
                                CR_TOTAL: 0,
                                OBS: '',
                                id: {
                                    EMPRESA: data[i].EMPRESA,
                                    CR_FILIAL: '00',
                                    C7_NUM: '000000'
                                },
                                CR_EMISSAO_DISP: '',
                                CR_TOTAL_DISP: '',
                                CR_TOTAL_DISP_REAIS: '',
                                isSELTODOS: true
                            });
                        } else {
                            //coloca novas propriedades no array, que não são entregues pelo backend
                            var EMPRESA,
                                CR_EMISSAO_DISP,
                                CR_TOTAL_DISP,
                                CR_TOTAL_DISP_REAIS;

                            CR_EMISSAO_DISP = new Date(data[i].items[j].CR_EMISSAO).ddmmyyyy();
                            CR_TOTAL_DISP = data[i].items[j].CR_TOTAL.formatMoney(2, ',', '.');
                            CR_TOTAL_DISP_REAIS = 'R$ ' + data[i].items[j].CR_TOTAL.formatMoney(2, ',', '.');

                            $.extend(data[i].items[j],
                                {
                                    EMPRESA: data[i].EMPRESA,
                                    id: {
                                        EMPRESA: data[i].items[j].EMPRESA,
                                        CR_FILIAL: data[i].items[j].CR_FILIAL,
                                        C7_NUM: data[i].items[j].C7_NUM
                                    },
                                    CR_EMISSAO_DISP: CR_EMISSAO_DISP,
                                    CR_TOTAL_DISP: CR_TOTAL_DISP,
                                    CR_TOTAL_DISP_REAIS: CR_TOTAL_DISP_REAIS,
                                    isSELTODOS: false
                                });
                        }
                    };


                    arrayPedidosCompra.push(data[i]);
                };

                mappedArrayPedidosCompra = $.map(arrayPedidosCompra, function (data) {
                    return new pedidoCompraGrupos(data);
                });

                //console.log(mappedArrayPedidosCompra[0].items());
                //console.log(arrayPedidosCompra);

                db.data._pedCompra4tItems.load().done(function (data) {
                    if (data.length) {
                        //Percorre todos os itens dos pedidos de compra que é o datasource do Accordion
                        for (var i = 0; i < mappedArrayPedidosCompra.length; i++) {
                            for (var j = 0; j < mappedArrayPedidosCompra[i].items().length; j++) {

                                //Busca informações dentro do _pedidoCompra4tItems resgatado do offline
                                //Tomando por base a chave composta
                                var pedidoItemPorKey = $.grep(data, function (e) {
                                    return e.USER == params.id.codAprovador &&
                                        e.EMPRESA == mappedArrayPedidosCompra[i].items()[j].EMPRESA &&
                                        e.CR_FILIAL == mappedArrayPedidosCompra[i].items()[j].CR_FILIAL &&
                                        e.C7_NUM == mappedArrayPedidosCompra[i].items()[j].C7_NUM;
                                });

                                //console.log(pedidoItemPorKey);

                                if (pedidoItemPorKey.length > 0) {
                                    //console.log('achei ' + mappedArrayPedidosCompra[i].items()[j].C7_NUM);

                                    mappedArrayPedidosCompra[i].items()[j].SEL(true);
                                } else {
                                    //console.log('não achei ' + mappedArrayPedidosCompra[i].items()[j].C7_NUM);

                                    mappedArrayPedidosCompra[i].items()[j].SEL(false);
                                };
                            }
                        };
                    };
                });


                dataSourceAccordion(mappedArrayPedidosCompra);

                //var accordion = $('#accordion').dxAccordion('instance');

                //for (var j = 0; j < mappedArrayPedidosCompra.length - 1; j++) {
                //    accordion.expandItem(j);
                //};

                //console.log('set dataSourceAccordion');

                infoIsReady.resolve();
            });
    };


    var viewModel = {
        infoIsReady: infoIsReady.promise(),
        viewShown: viewShownEvent,
        codAprovador: params.id.codAprovador,
        flgOperacao: ko.observable(''),
        accordionOptions: {
            height: 'auto',
            dataSource: dataSourceAccordion,
            noDataText: 'Não há informações disponíveis',
            selectedIndex: -1,
            animationDuration: 700,
            collapsible: true,
            multiple: true,
            //onInitialized: function (e) {
            //    console.log('onInitialized');

            //    accordionInstance = e.component;

            //    for (var j = 0; j < accordionInstance.getDataSource()._items.length; j++) {
            //        accordionInstance.expandItem(j);
            //    };

            //},
            onContentReady: function (e) {
                //console.log('onContentReady');

                accordionInstance = e.component;

                for (var j = 0; j < accordionInstance.getDataSource()._items.length; j++) {
                    accordionInstance.expandItem(j);
                };

            }
        },
        loadingVisible: ko.observable(false),
        loadpanelMessage: ko.observable('Carregando...')
    };
    
    viewModel.detalharButtonOptions = function (data) {
        return {
            icon: "chevronnext",
            visible: !data.isSELTODOS,
            onClick: function(e) {
                //console.log(e);
                var uri = AppPedidos4tAvi.app.router.format({
                    view: 'liberacaoDetalhe',
                    id: {
                        codAprovador: viewModel.codAprovador,
                        empresa: e.model.EMPRESA,
                        codFilial: e.model.CR_FILIAL,
                        numPedido: e.model.C7_NUM,
                        codFornecedor: e.model.C7_FORNECE,
                        codLoja: e.model.C7_LOJA,
                        nomeFornecedor: e.model.A2_NOME,
                        dataEmissao: e.model.CR_EMISSAO_DISP,
                        valorTotal: e.model.CR_TOTAL_DISP,
                        quemIncluiu: e.model.C7_ZZINCNO,
                        obs: e.model.OBS
                    }
                });
                AppPedidos4tAvi.app.navigate(uri);
            }
        }
    };

    viewModel.listOptions = function (data) {
        return {
            dataSource: data.items,
            noDataText: 'Não há informações disponíveis',
            pageLoadingText: 'Carregando...',
            showSelectionControls: false,
            selectionMode: 'all',
            selectAllMode: 'allPages',
            selectedItemKeys: selectedItemKeys,
            onSelectionChanged: function (e) {
                //console.log(e.model.listOptions.selectedItemKeys());
                //console.log(viewModel.textoLiberar());
            },
            pullRefreshEnabled: true,
            onPullRefresh: function () {
                viewShownEvent()
            },
            pullingDownText: 'Solte para atualizar...',
            pulledDownText: 'Puxe para atualizar...',
            refreshingText: 'Atualizando...'
        }
    };

    viewModel.checkboxSelOptions = function (data) {
        return {
            value: data.SEL,
            onValueChanged: function(e) {
                //console.log(e);
                if (e.model.CR_FILIAL + e.model.C7_NUM == '00000000') {
                    selecionaTodosPorEmpresa(e.model.EMPRESA, e.model.SEL());
                };
            }
        }
    };

    viewModel.loadOptions = {
        visible: viewModel.loadingVisible,
        message: viewModel.loadpanelMessage,
        closeOnOutsideClick: false
    };

    viewModel.pedidoCompraResumoObject = ko.computed(function () {
        var _pedidoCompraResumoObjectAux = new pedidoCompraResumoObjectAux();

        return _pedidoCompraResumoObjectAux;
    });

    viewModel.pedidoCompraResumoArray = ko.computed(function () {
        var returnArray = [];

        if (viewModel.pedidoCompraResumoObject()) {
            returnArray = viewModel.pedidoCompraResumoObject().arrayResumo;
        };

        return returnArray;
    });

    //viewModel.pedidoCompraObjectPayload = ko.computed(function () {
    //    var mappedArrayItems = $.map(viewModel.listOptions.selectedItemKeys(), function (data) {
    //        return {
    //            empresa: data.EMPRESA,
    //            codFilial: data.CR_FILIAL,
    //            numPedido: data.C7_NUM
    //        };
    //    });

    //    return {
    //        codAprovador: viewModel.codAprovador,
    //        flgOperacao: viewModel.flgOperacao(),
    //        pedidos: mappedArrayItems
    //    };
    //});


    viewModel.pedidoCompraObjectPayload = ko.computed(function () {
        var mappedArrayItems = $.map(viewModel.pedidoCompraResumoArray(), function (data) {
            return {
                empresa: data.EMPRESA,
                codFilial: data.CR_FILIAL,
                numPedido: data.C7_NUM
            };
        });

        //Filtrar payload com $.grep para remover codFilial = "00" and numPedido = "000000"
        var mappedArrayItemsFiltrado = $.grep(mappedArrayItems, function (e) { return (e.codFilial + e.numPedido !== '00000000'); });
        //console.log(mappedArrayItemsFiltrado);

        return {
            codAprovador: viewModel.codAprovador,
            flgOperacao: viewModel.flgOperacao(),
            pedidos: mappedArrayItemsFiltrado
        };
    });


    viewModel.operacaoHabilitada = ko.computed(function () {
        //Seleção existe? Se existe, está habilitado a executar operações como liberar ou bloquear

        //return !(viewModel.listOptions.selectedItemKeys().length > 0);

        return (!viewModel.pedidoCompraResumoArray().length > 0);
    });
    
    viewModel.textoNumeroPedidos = ko.computed(function () {
        var texto = '';

        //if (viewModel.listOptions.selectedItemKeys().length == 1) {
        //    texto = '1 pedido';
        //} else if (viewModel.listOptions.selectedItemKeys().length > 1) {
        //    texto = viewModel.listOptions.selectedItemKeys().length + ' pedidos';
        //};


        if (viewModel.pedidoCompraResumoArray().length == 1) {
            texto = '1 pedido';
        } else if (viewModel.pedidoCompraResumoArray().length > 1) {
            texto = viewModel.pedidoCompraResumoArray().length + ' pedidos';
        };


        return texto;
    });

    viewModel.textoLiberar = ko.computed(function () {
        return 'Liberar ' + viewModel.textoNumeroPedidos();
    });

    viewModel.textoBloquear = ko.computed(function () {
        return 'Bloquear ' + viewModel.textoNumeroPedidos();
    });

    viewModel.navbar = {
        items: [
        { text: viewModel.textoLiberar, icon: "check", disabled: viewModel.operacaoHabilitada },
        { text: viewModel.textoBloquear, icon: "clear", disabled: viewModel.operacaoHabilitada }
        ],
        selectedIndex: ko.observable(-1)
    };

    function processaOperacao(flgOperacao) {
        var textoConfirma;

        switch (flgOperacao) {
            case 'L':
                textoConfirma = 'Confirma liberação de '

                break;
            case 'B':
                textoConfirma = 'Confirma bloqueio de '

                break;
        };

        var customDialog = DevExpress.ui.dialog.custom({
            title: "Confirmar",
            message: textoConfirma + viewModel.textoNumeroPedidos() + " ?",
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

                //console.log(viewModel.pedidoCompraObjectPayload());

                db.data.PedidoCompra.insert(viewModel.pedidoCompraObjectPayload())
                    .done(function (data) {
                        //Inserção ocorreu com sucesso

                        //console.log(data);

                        db.data._pedCompra4tItems.clear();

                        viewModel.loadingVisible(false);
                        viewModel.navbar.selectedIndex(-1);

                        viewShownEvent();
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