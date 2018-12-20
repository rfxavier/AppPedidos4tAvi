AppPedidos4tAvi.relViewParamDiaInicialFinal = function (params) {
    "use strict";

    var title = ko.observable(params.id.viewTitle);

    var viewerModel = ko.observable(null);

    var backendPrefix = AppPedidos4tAvi.config.endpoints.db.production;// URI of your backend project. 
    DevExpress.Report.Preview.HandlerUri = backendPrefix + "WebDocumentViewer/Invoke";

    function viewShownEvent() {
        var parRelNome = params.id.relNome;
        var parDiaInicial = params.id.diaInicial;
        var parDiaFinal = params.id.diaFinal;
        var parReportClass;
        var parReportEntryObj;

        switch (parRelNome) {
            case 'relVendasVendedor':
                parReportClass = 'repCnVendasVendasDiariaVendedorLive';

                parReportEntryObj = {
                    reportClass: parReportClass,
                    reportParamCodVendedor: db.userInfo.codigoVendedor,
                    reportParamDiaInicial: parDiaInicial,
                    reportParamDiaFinal: parDiaFinal
                };

                break;
            case 'relCliBloqVendedor':
                parReportClass = 'repCnVendasClientesBloqueadosVendedor';

                parReportEntryObj = {
                    reportClass: parReportClass,
                    reportParamCodVendedor: db.userInfo.codigoVendedor
                };

                break;
            default:
                parReportClass = '';
        };

        if (parReportClass && db.userInfo.codigoVendedor) { //&& parDiaInicial && parDiaFinal
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