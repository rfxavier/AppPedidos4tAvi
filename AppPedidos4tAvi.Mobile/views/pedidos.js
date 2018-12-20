AppPedidos4tAvi.pedidos = function (params) {
    var infoIsReady = $.Deferred();

    var datasourcePedidos = new DevExpress.data.DataSource({ store: [] }),
        dataSourceActionSheet = ko.observableArray([]),
        commandOpcaoPesquisaHabilitada = ko.observable(false);

    var flgStatusDisplay = function (status) {
        if (status == "A") { return "Em Aberto" }
        else if (status == "E") { return "Enviado" }
        else if (status == "R") { return "Rejeitado" }
        else if (status.lastIndexOf("A ", 0) === 0) { return status.replace(/A /g, "Em Aberto "); }
        else if (status.lastIndexOf("E ", 0) === 0) { return status.replace(/E /g, "Enviado "); }
        else { return status };
    };

    function viewShownEvent() {
        if (AppPedidos4tAvi.config.offlineCache) {
            console.log('fazendo cache offline de pedido corrente');

            db.data._ped4tHeader.load().done(function (data) {
                if (data.length) {
                    if (data[0].status == 'P' && data[0].codVendedor) {
                        //Se achou conteúdo em _ped4tHeader
                        //Se nesse conteúdo existe a propriedade codVendedor
                        //Se o status == P (Pendente), quer dizer que não fechou ciclo de um envio correto
                        if (data[0].codVendedor == db.userInfo.codigoVendedor) {
                            //Se o código de vendedor do pedido em cache offline é o mesmo do vendedor sendo feito o login
                            console.log('tem pedido não concluído, resgatar de offline');

                            var customDialog = DevExpress.ui.dialog.custom({
                                title: "Operação pendente",
                                message: "Encontrado pedido não concluído. Deseja recuperar ?",
                                toolbarItems: [
                                    { text: "Sim", onClick: function () { return true; } },
                                    { text: "Não", onClick: function () { return false; } }
                                ]
                            });

                            customDialog.show().done(function (dialogResult) {
                                if (dialogResult) {
                                    var uri = AppPedidos4tAvi.app.router.format({
                                        view: 'pedidoDetalhe',
                                        id: {
                                            codVendedor: data[0].codVendedor,
                                            utilizaCota: data[0].utilizaCota,
                                            codCliente: data[0].codCliente,
                                            nomeCliente: data[0].nomeCliente,
                                            endCliente: data[0].endCliente,
                                            codLoja: data[0].codLoja,
                                            navToView: 'inicio',
                                            tipoOperacao: 'restore',
                                            numeroPedido: 0
                                        }
                                    });
                                    AppPedidos4tAvi.app.navigate(uri);

                                };
                            });

                        } else {
                            //Não fechou ciclo de um envio correto
                            //Mas o vendedor que fez login não é o mesmo

                            console.log('tem pedido não concluído, vendedor logando é outro, apagar');

                            db.data._ped4tHeader.update(1, { status: 'F' });
                            db.data._ped4tItems.clear();
                        }
                    }
                } else {
                    //É a primeira vez que loga com sucesso, inicializar conteúdo offline de _ped4tHeader com status == F (Fechado)
                    db.data._ped4tHeader.insert({ id: 1, status: 'F' });
                }
            });
        };

        db.data.Pedido.Datasource.group({ field: "pFlgStatus" });

        if (params.id.codCliente && params.id.codLoja) {
            //Está chegando aqui nesta view pedidos pela view de periodoPedido, carregando informações de cliente e datas inicial e final
            //Deverá filtrar datasource por essas restrições

            console.log('cheguei pela view periodoPedido');
            console.log(params.id.codCliente);
            console.log(params.id.codLoja);
            console.log(params.id.dataInicial);
            console.log(params.id.dataFinal);

            if (params.id.codSubVendedor) {
                db.data.Pedido.Datasource.filter("codSubVendedor", "=", params.id.codSubVendedor);
            } else {
                db.data.Pedido.Datasource.filter("A1_VEND", "=", params.id.codVendedor);
            };
        } else {
            //Está chegando nesta view pedidos pela navegação do menu inicial
            //Deverá filtrar datasource pelo default = somente vendedor ou sub-vendedor

            console.log('cheguei pelo menu inicial');

            if (params.id.codSubVendedor) {
                db.data.Pedido.Datasource.filter("codSubVendedor", "=", params.id.codSubVendedor);
            } else {
                //Habilita opção de pesquisar
                commandOpcaoPesquisaHabilitada(true);

                db.data.Pedido.Datasource.filter("A1_VEND", "=", params.id.codVendedor);
            };
        }

        db.data.Pedido.Datasource.load()
            .done(function (data) {
                datasourcePedidos.store().clear();

                for (var i = 0; i < data.length; i++) {
                    //coloca novas propriedades no array, que não são entregues pelo backend
                    $.extend(data[i], {
                        pFlgStatusDisp: flgStatusDisplay(data[i].pFlgStatus)
                    });

                    for (var j = 0; j < data[i].items.length; j++) {
                        var pDataEmissaoDisp,
                            pNumeroItensDisp,
                            pValorTotalDisp,
                            pValorTotalDispReais,
                            pA1_NOME_DISP;

                        pDataEmissaoDisp = new Date(data[i].items[j].pDataEmissao).ddmmyyyy() + ' ' + (data[i].items[j].pObservacaoResumida || '');
                        pNumeroItensDisp = data[i].items[j].pNumeroItens + ((data[i].items[j].pNumeroItens > 1) ? ' itens' : ' item');
                        pValorTotalDisp = data[i].items[j].pValorTotal.formatMoney(2, ',', '.');
                        pValorTotalDispReais = 'R$ ' + data[i].items[j].pValorTotal.formatMoney(2, ',', '.');
                        pA1_NOME_DISP = data[i].items[j].pA1_END == null ? data[i].items[j].pA1_NOME : data[i].items[j].pA1_NOME + ' (' + data[i].items[j].pA1_END + ')'

                        //coloca novas propriedades no array, que não são entregues pelo backend
                        $.extend(data[i].items[j], {
                            pFlgStatusDisp: flgStatusDisplay(data[i].items[j].pFlgStatus),
                            pA1_NOME_DISP: pA1_NOME_DISP,
                            pDataEmissaoDisp: pDataEmissaoDisp,
                            pNumeroItensDisp: pNumeroItensDisp,
                            pValorTotalDisp: pValorTotalDisp,
                            pValorTotalDispReais: pValorTotalDispReais
                        });

                    };

                    datasourcePedidos.store().insert(data[i]);
                };

                datasourcePedidos.paginate(false);
                datasourcePedidos.load();
                infoIsReady.resolve();
            });
    };

    function abreClientes() {
        var uri = AppPedidos4tAvi.app.router.format({
            view: 'clientes',
            id: {
                codVendedor: params.id.codVendedor,
                utilizaCota: params.id.utilizaCota,
                codSubVendedor: params.id.codSubVendedor,
                navToView: 'pedidoDetalhe',
                tipoOperacao: 'ins'
            }
        });
        AppPedidos4tAvi.app.navigate(uri);
    };

    function pesquisarPedidos() {
        var uri = AppPedidos4tAvi.app.router.format({
            view: 'clientes',
            id: {
                codVendedor: params.id.codVendedor,
                utilizaCota: params.id.utilizaCota,
                codSubVendedor: params.id.codSubVendedor,
                navToView: 'periodoPedidos'
            }
        });
        AppPedidos4tAvi.app.navigate(uri);
    };

    function processaClickActionSheet(action, itemData) {
        switch (action) {
            case "Continuar":
                var uri = AppPedidos4tAvi.app.router.format({
                    view: 'pedidoDetalhe',
                    id: {
                        codVendedor: itemData.pA3_COD,
                        codSubVendedor: itemData.pCodigoSubVendedor,
                        utilizaCota: db.userInfo.utilizaCota,
                        codCliente: itemData.pA1_COD,
                        nomeCliente: itemData.pA1_NOME,
                        endCliente: itemData.pA1_END,
                        codLoja: itemData.pA1_LOJA,
                        navToView: 'inicio',
                        tipoOperacao: 'alt',
                        numeroPedido: itemData.pNumeroPedido
                    }
                });
                AppPedidos4tAvi.app.navigate(uri);

                break;
            case "Excluir":
                var customDialog = DevExpress.ui.dialog.custom({
                    title: "Confirmar",
                    message: "Excluir pedido " + itemData.pNumeroPedido + " ?",
                    toolbarItems: [
                        { text: "Sim", onClick: function () { return true; } },
                        { text: "Não", onClick: function () { return false; } }
                    ]
                });

                customDialog.show().done(function (dialogResult) {
                    if (dialogResult) {
                        db.data.Pedido.Datasource.store().remove(itemData.pNumeroPedido)
                            .done(function () {
                                DevExpress.ui.notify("Excluído pedido " + itemData.pNumeroPedido, "success", 2000);

                                viewShownEvent();
                            });
                    };
                });

                break;
            case "Consultar":
                var uri = AppPedidos4tAvi.app.router.format({
                    view: 'pedidoDetalhe',
                    id: {
                        codVendedor: itemData.pA3_COD,
                        codCliente: itemData.pA1_COD,
                        nomeCliente: itemData.pA1_NOME,
                        endCliente: itemData.pA1_END,
                        codLoja: itemData.pA1_LOJA,
                        navToView: 'inicio',
                        tipoOperacao: 'cons',
                        numeroPedido: itemData.pNumeroPedido
                    }
                });
                AppPedidos4tAvi.app.navigate(uri);

                break;

            case "Duplicar":
                var uri = AppPedidos4tAvi.app.router.format({
                    view: 'pedidoDetalhe',
                    id: {
                        codVendedor: itemData.pA3_COD,
                        codSubVendedor: itemData.pCodigoSubVendedor,
                        utilizaCota: db.userInfo.utilizaCota,
                        codCliente: itemData.pA1_COD,
                        nomeCliente: itemData.pA1_NOME,
                        endCliente: itemData.pA1_END,
                        codLoja: itemData.pA1_LOJA,
                        navToView: 'inicio',
                        tipoOperacao: 'dup',
                        numeroPedido: itemData.pNumeroPedido
                    }
                });
                AppPedidos4tAvi.app.navigate(uri);

                break;

        }
    };

    var dsActionSheetContextItemData = function (itemData) {
        var arrayActions = [];

        if (itemData.pFlgStatus == 'A') {
            arrayActions.push({ text: "Continuar", onClick: function () { processaClickActionSheet("Continuar", itemData) } });
            arrayActions.push({ text: "Excluir", onClick: function () { processaClickActionSheet("Excluir", itemData) } });
        };

        if (itemData.pFlgStatus == 'E') {
            arrayActions.push({ text: "Consultar", onClick: function () { processaClickActionSheet("Consultar", itemData) } });
            arrayActions.push({ text: "Duplicar", onClick: function () { processaClickActionSheet("Duplicar", itemData) } });
        };

        if (itemData.pFlgStatus == 'R') {
            arrayActions.push({ text: "Consultar", onClick: function () { processaClickActionSheet("Consultar", itemData) } });
        };

        //Ordenar array antes de retornar 
        return arrayActions;
    };

    var viewModel = {
        infoIsReady: infoIsReady.promise(),
        viewShown: viewShownEvent,
        commandNovoPedido: abreClientes,
        commandPesquisarPedido: pesquisarPedidos,
        listOptions: {
            dataSource: datasourcePedidos,
            grouped: true,
            collapsibleGroups: true,
            groupTemplate: 'grupoStatus',
            itemTemplate: 'item',
            onItemClick: function (e) {
                dataSourceActionSheet(dsActionSheetContextItemData(e.itemData));
                e.model.actionSheetOptions.title("Ação no pedido " + e.itemData.pNumeroPedido);
                e.model.actionSheetOptions.visible(true);
            },
            noDataText: 'Não há informações disponíveis',
            pageLoadingText: 'Carregando...',
            onContentReady: function (e) {
                var items = e.component.option("items");

                if (items.length > 0) {
                    for (var i = 1; i < items.length; i++)
                        e.component.collapseGroup(i);
                };

                infoIsReady.resolve();
            }
        },
        actionSheetOptions: {
            dataSource: dataSourceActionSheet,
            title: ko.observable("Ação no pedido "),
            visible: ko.observable(false),
            showTitle: ko.observable(true),
            cancelText: "Retornar",
            showCancelButton: ko.observable(true),
            onCancelClick: function () {

            }
        }
    };

    viewModel.commandPesquisarPedidoOptions =
        {
            id: 'edit',
            onExecute: viewModel.commandPesquisarPedido,
            title: 'Pesquisar',
            icon: 'search',
            visible: commandOpcaoPesquisaHabilitada
        };

    viewModel.commandNovoPedidoOptions =
        {
            id: 'create',
            onExecute: viewModel.commandNovoPedido,
            title: 'Novo',
            icon: 'add'
        };

    return viewModel;
};