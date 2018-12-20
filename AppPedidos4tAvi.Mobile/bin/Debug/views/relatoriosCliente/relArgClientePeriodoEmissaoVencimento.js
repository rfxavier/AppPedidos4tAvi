AppPedidos4tAvi.relArgClientePeriodoEmissaoVencimento = function(params) {
    "use strict";
    var dataHoje = new Date();
    var dataAnterior = new Date();
    dataAnterior.setDate(dataHoje.getDate() - 7);

    var pedidoDataEmissaoInicial = ko.observable(dataAnterior);
    var pedidoDataEmissaoFinal = ko.observable(dataHoje);

    var pedidoDataVencimentoInicial = ko.observable(dataAnterior);
    var pedidoDataVencimentoFinal = ko.observable(dataHoje);

    var viewModel = {
        pedidoDataEmissaoInicial: pedidoDataEmissaoInicial,
        pedidoDataEmissaoFinal: pedidoDataEmissaoFinal,
        pedidoDataVencimentoInicial: pedidoDataVencimentoInicial,
        pedidoDataVencimentoFinal: pedidoDataVencimentoFinal
    };

    viewModel.dateboxDataEmissaoInicialOptions = {
        value: pedidoDataEmissaoInicial,
        displayFormat: 'dd/MM/yyyy',
        pickerType: "calendar",
        placeholder: 'Data Emissão Inicial',
        applyButtonText: 'Ok',
        cancelButtonText: 'Cancelar',
        showClearButton: true
    };

    viewModel.dateboxDataEmissaoFinalOptions = {
        value: pedidoDataEmissaoFinal,
        displayFormat: 'dd/MM/yyyy',
        pickerType: "calendar",
        placeholder: 'Data Emissão Final',
        applyButtonText: 'Ok',
        cancelButtonText: 'Cancelar',
        showClearButton: true
    };

    viewModel.dateboxDataVencimentoInicialOptions = {
        value: pedidoDataVencimentoInicial,
        displayFormat: 'dd/MM/yyyy',
        pickerType: "calendar",
        placeholder: 'Data Vencimento Inicial',
        applyButtonText: 'Ok',
        cancelButtonText: 'Cancelar',
        showClearButton: true
    };

    viewModel.dateboxDataVencimentoFinalOptions = {
        value: pedidoDataVencimentoFinal,
        displayFormat: 'dd/MM/yyyy',
        pickerType: "calendar",
        placeholder: 'Data Vencimento Final',
        applyButtonText: 'Ok',
        cancelButtonText: 'Cancelar',
        showClearButton: true
    };


    viewModel.desabilitaPesquisa = ko.computed(function() {
        return !(pedidoDataEmissaoInicial() &&
            pedidoDataEmissaoFinal() &&
            pedidoDataVencimentoInicial() &&
            pedidoDataVencimentoFinal());
    });

    viewModel.buttonPesquisarOptions = {
        text: 'Pesquisar',
        disabled: viewModel.desabilitaPesquisa,
        onClick: function(e) {
            var uri = AppPedidos4tAvi.app.router.format({
                view: 'relArgClienteStatusTitulos',
                id: {
                    codCliente: params.id.codCliente,
                    codLoja: params.id.codLoja,
                    viewTitle: params.id.viewTitle,
                    relNome: params.id.relNome,
                    diaEmissaoInicial: pedidoDataEmissaoInicial(),
                    diaEmissaoFinal: pedidoDataEmissaoFinal(),
                    diaVencimentoInicial: pedidoDataVencimentoInicial(),
                    diaVencimentoFinal: pedidoDataVencimentoFinal()
                }
            });
            AppPedidos4tAvi.app.navigate(uri);
        }
    };

    return viewModel;
};