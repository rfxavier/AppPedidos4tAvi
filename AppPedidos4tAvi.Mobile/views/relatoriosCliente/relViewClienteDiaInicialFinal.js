AppPedidos4tAvi.relViewClienteDiaInicialFinal = function (params) {
    "use strict";

    var title = ko.observable(params.id.viewTitle);

    var viewerModel = ko.observable(null);

    var backendPrefix = AppPedidos4tAvi.config.endpoints.db.production;// URI of your backend project. 
    DevExpress.Report.Preview.HandlerUri = backendPrefix + "WebDocumentViewer/Invoke";

    function viewShownEvent() {
        var parRelNome = params.id.relNome;
        var parCodCliente = params.id.codCliente;
        var parCodLoja = params.id.codLoja;
        var parDiaInicial = params.id.diaInicial;
        var parDiaFinal = params.id.diaFinal;
        var parReportClass;

        switch (parRelNome) {
            case 'relVendasVendCli':
                parReportClass = 'repCnVendasVendasDiariaVendedorClienteLive';
                break;
            case 'relVendasPedAVendCli':
                parReportClass = 'repCnVendasPedidosAbertosVendedorClienteLive';
                break;
        default:
            parReportClass = '';
        };

        var parReportEntryObj = {
            reportClass: parReportClass,
            reportParamCodVendedor: db.userInfo.codigoVendedor,
            reportParamCodCliente: parCodCliente,
            reportParamCodLoja: parCodLoja,
            reportParamDiaInicial: parDiaInicial,
            reportParamDiaFinal: parDiaFinal
        };

        if (parReportClass
            && db.userInfo.codigoVendedor
            && parCodCliente
            && parCodLoja
            && parDiaInicial
            && parDiaFinal) {
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