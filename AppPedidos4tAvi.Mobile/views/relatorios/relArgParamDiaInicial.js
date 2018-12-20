AppPedidos4tAvi.relArgParamDiaInicial = function (params) {
    "use strict"
    //hoje
    var dataRef = new Date();
    //ontem
    dataRef.setDate(dataRef.getDate() - 0);

    var currentDate = ko.observable(dataRef);
    var title = ko.observable(params.id.viewTitle);

    var viewModel = {
        title: title,
        calendarOptions: {
            firstDayOfWeek: 1,
            value: currentDate
        }
    };

    viewModel.buttonText = ko.computed(function () {
        return 'Selecionar dia inicial ' + currentDate().ddmmyyyy();
    });

    viewModel.buttonOptions = {
        text: viewModel.buttonText,
        onClick: function (e) {
            var uri = AppPedidos4tAvi.app.router.format({
                view: 'relArgParamDiaFinal',
                id: {
                    viewTitle: params.id.viewTitle,
                    relNome: params.id.relNome,
                    diaInicial: currentDate().ddmmyyyy()
                }
            });
            AppPedidos4tAvi.app.navigate(uri);

        }
    };

    return viewModel;
};