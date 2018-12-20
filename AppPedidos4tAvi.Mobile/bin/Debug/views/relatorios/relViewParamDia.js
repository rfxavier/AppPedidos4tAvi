AppPedidos4tAvi.relViewParamDia = function (params) {
    "use strict";

    var title = ko.observable(params.id.viewTitle);

    var viewerModel = ko.observable(null);
    //var reportList = ko.observable(null);
    //var reportListPlaceholder = ko.observable("Report List is Loading...");

    //var currentReport = ko.observable(null);
    //currentReport.subscribe(function (newVal) {
    //    newVal && viewerModel() && viewerModel().reportPreview.openReport(newVal);
    //});

    //var backendPrefix = "http://localhost:1992";// URI of your backend project. 
    var backendPrefix = AppPedidos4tAvi.config.endpoints.db.production;// URI of your backend project. 
    DevExpress.Report.Preview.HandlerUri = backendPrefix + "WebDocumentViewer/Invoke";

    //$.post(backendPrefix + "/WebDocumentViewer/GetReportList") // Get the list of available reports from the server. 
    //    .done(function (response) {
    //        reportListPlaceHolder("Select a report...")
    //        reportList(response);
    //    })
    //    .fail(function (error) {
    //        reportListPlaceholder("No reports to show...");
    //    });

    function viewShownEvent() {
        var parRelNome = params.id.relNome;
        var parDia = params.id.dia;
        var parReportClass;
        var parReportEntryObj;

        switch (parRelNome) {
            case 'relEnvase':
                parReportClass = 'repCnIndEnvaseOverview'

                parReportEntryObj = { reportClass: parReportClass, reportParamDia: parDia };

                break;
            case 'relLeiteCamFrias':
                parReportClass = 'repCnIndLeiteCamarasFriasOverview'

                parReportEntryObj = { reportClass: parReportClass, reportParamDia: parDia };

                break;
            case 'relVendasVendedor':
                parReportClass = 'repCnVendasVendasDiariaVendedorLive'

                parReportEntryObj = {
                    reportClass: parReportClass,
                    reportParamCodVendedor: db.userInfo.codigoVendedor,
                    reportParamDiaInicial: parDia,
                    reportParamDiaFinal: parDia
                };

                break;
            default:
                parReportClass = '';
        };


        if (parReportClass && parDia) {
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