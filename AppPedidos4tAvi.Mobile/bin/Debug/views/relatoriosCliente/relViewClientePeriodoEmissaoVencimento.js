AppPedidos4tAvi.relViewClientePeriodoEmissaoVencimento = function (params) {
    "use strict";

    var title = ko.observable(params.id.viewTitle);

    var viewerModel = ko.observable(null);

    var backendPrefix = AppPedidos4tAvi.config.endpoints.db.production;// URI of your backend project. 
    DevExpress.Report.Preview.HandlerUri = backendPrefix + "WebDocumentViewer/Invoke";

    function viewShownEvent() {
        var parRelNome = params.id.relNome;
        var parCodCliente = params.id.codCliente;
        var parCodLoja = params.id.codLoja;
        var parDiaEmissaoInicial = params.id.diaEmissaoInicial;
        var parDiaEmissaoFinal = params.id.diaEmissaoFinal;
        var parDiaVencimentoInicial = params.id.diaVencimentoInicial;
        var parDiaVencimentoFinal = params.id.diaVencimentoFinal;
        var parStatusTitulos = params.id.statusTitulos ? params.id.statusTitulos : 'A';
        var parReportClass;

        switch (parRelNome) {
            case 'relTitulosVendCli':
                parReportClass = 'repCnFinanceiroTitulosVendedorCliente';
                break;
            default:
                parReportClass = '';
        };

        var parReportEntryObj = {
            reportClass: parReportClass,
            reportParamCodVendedor: db.userInfo.codigoVendedor,
            reportParamCodCliente: parCodCliente,
            reportParamCodLoja: parCodLoja,
            reportParamDiaEmissaoInicial: parDiaEmissaoInicial,
            reportParamDiaEmissaoFinal: parDiaEmissaoFinal,
            reportParamDiaVencimentoInicial: parDiaVencimentoInicial,
            reportParamDiaVencimentoFinal: parDiaVencimentoFinal,
            reportParamStatusTitulos: parStatusTitulos
        };

        if (parReportClass
            && db.userInfo.codigoVendedor
            && parCodCliente
            && parCodLoja
            && parDiaEmissaoInicial
            && parDiaEmissaoFinal
            && parDiaVencimentoInicial
            && parDiaVencimentoFinal) {
            viewerModel() && viewerModel().reportPreview.openReport(JSON.stringify(parReportEntryObj));
        };
    };

    var viewModel = {
        title: title,
        viewShown: viewShownEvent,
        viewerModel: viewerModel,   //An output parameter for the dxReportViewer binding.   
        // This object provides client API to customize the Web Document Viewer. 
        callbacks: {}  // An input parameter for the dxReportViewer binding.   
        // Use this object to customize specific Web Document Viewer callbacks. 
        //reportListPlaceholder: reportListPlaceholder,
        //reportList: reportList,
        //currentReport: currentReport
    };
    viewerModel.subscribe(function (newModel) {
        if (newModel)
            newModel.reportPreview.zoom(DevExpress.Report.Preview.ZoomAutoBy.PageWidth);
    });

    return viewModel;
};