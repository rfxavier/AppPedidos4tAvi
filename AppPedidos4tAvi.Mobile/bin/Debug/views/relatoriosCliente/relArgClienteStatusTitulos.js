AppPedidos4tAvi.relArgClienteStatusTitulos = function (params) {
    "use strict";

    var currentOption = ko.observable("Aberto");
    var title = ko.observable(params.id.viewTitle);

    var viewModel = {
        title: title,
        options: [
            { text: "Aberto", value: "Aberto" },
            { text: "Fechado", value: "Fechado" }
        ]
    };

    viewModel.radioGroupOptions = {
        items: viewModel.options,
        onValueChanged: function(e) {
            currentOption(e.value);
        },
        valueExpr: 'value',
        value: currentOption
    };

    viewModel.statusTitulos = ko.computed(function() {
        return currentOption().charAt(0);
    });

    viewModel.buttonText = ko.computed(function () {
        return 'Selecionar ' + currentOption();
    });

    viewModel.buttonOptions = {
        text: viewModel.buttonText,
        onClick: function (e) {
            var navToView = 'relViewClientePeriodoEmissaoVencimento';

            var uri = AppPedidos4tAvi.app.router.format({
                view: navToView,
                id: {
                    codCliente: params.id.codCliente,
                    codLoja: params.id.codLoja,
                    viewTitle: params.id.viewTitle,
                    relNome: params.id.relNome,
                    diaEmissaoInicial: params.id.diaEmissaoInicial,
                    diaEmissaoFinal: params.id.diaEmissaoFinal,
                    diaVencimentoInicial: params.id.diaVencimentoInicial,
                    diaVencimentoFinal: params.id.diaVencimentoFinal,
                    statusTitulos: viewModel.statusTitulos()
                }
            });
            AppPedidos4tAvi.app.navigate(uri);
        }
    };

    return viewModel;
};