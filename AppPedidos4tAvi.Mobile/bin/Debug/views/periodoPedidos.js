AppPedidos4tAvi.periodoPedidos = function (params) {
    "use strict";
    var dataHoje = new Date();
    var dataAnterior = new Date();
    dataAnterior.setDate(dataHoje.getDate() - 7);

    var pedidoDataInicial = ko.observable(dataAnterior);
    var pedidoDataFinal = ko.observable(dataHoje);

    var viewModel = {
        pedidoDataInicial: pedidoDataInicial,
        pedidoDataFinal: pedidoDataFinal
    };

    viewModel.dateboxDataInicialOptions = {
        value: pedidoDataInicial,
        displayFormat: 'dd/MM/yyyy',
        pickerType: "rollers",
        placeholder: 'Data Inicial',
        applyButtonText: 'Ok',
        cancelButtonText: 'Cancelar',
        showClearButton: true
    };

    viewModel.dateboxDataFinalOptions = {
        value: pedidoDataFinal,
        displayFormat: 'dd/MM/yyyy',
        pickerType: "rollers",
        placeholder: 'Data Final',
        applyButtonText: 'Ok',
        cancelButtonText: 'Cancelar',
        showClearButton: true
    };

    viewModel.desabilitaPesquisa = ko.computed(function() {
        return !(pedidoDataInicial() && pedidoDataFinal());
    });

    viewModel.buttonPesquisarOptions = {
        text: 'Pesquisar',
        disabled: viewModel.desabilitaPesquisa,
        onClick: function (e) {
            var uri = AppPedidos4tAvi.app.router.format({
                view: 'pedidos',
                id: {
                    codVendedor: db.userInfo.codigoVendedor,
                    utilizaCota: db.userInfo.utilizaCota,
                    codSubVendedor: db.userInfo.codigoSubVendedor,
                    codCliente: params.id.codCliente,
                    codLoja: params.id.codLoja,
                    dataInicial: pedidoDataInicial(),
                    dataFinal: pedidoDataFinal()
                }
            });
            AppPedidos4tAvi.app.navigate(uri);
        }
    };

    
    return viewModel;
};