$(function() {
    var startupView = "inicio";

    // Uncomment the line below to disable platform-specific look and feel and to use the Generic theme for all devices
    // DevExpress.devices.current({ platform: "generic" });

    if(DevExpress.devices.real().platform === "win") {
        $("body").css("background-color", "#000");
    }

    var isDeviceReady = false,
        isViewShown = false;

    function hideSplashScreen() {
        if (isDeviceReady && isViewShown) {
            navigator.splashscreen.hide();
        }
    }

    document.addEventListener("deviceready", function () {
        isDeviceReady = true;
        hideSplashScreen();
        $(document).on("backbutton", function () {
            DevExpress.processHardwareBackButton();
        });
    });

    function onViewShown() {
        isViewShown = true;
        hideSplashScreen();
        AppPedidos4tAvi.app.off("viewShown", onViewShown);
    }

    function onNavigatingBack(e) {
        if(e.isHardwareButton && !AppPedidos4tAvi.app.canBack()) {
            e.cancel = true;
            exitApp();
        }
    }

    function exitApp() {
        switch (DevExpress.devices.real().platform) {
            case "android":
                navigator.app.exitApp();
                break;
            case "win":
                window.external.Notify("DevExpress.ExitApp");
                break;
        }
    }

    var layoutSet = DevExpress.framework.html.layoutSets[AppPedidos4tAvi.config.layoutSet],
        navigation = AppPedidos4tAvi.config.navigation;

    AppPedidos4tAvi.app = new DevExpress.framework.html.HtmlApplication({
        namespace: AppPedidos4tAvi,
        layoutSet: layoutSet,
        animationSet: DevExpress.framework.html.animationSets[AppPedidos4tAvi.config.animationSet],
        navigation: navigation,
        commandMapping: AppPedidos4tAvi.config.commandMapping,
        navigateToRootViewMode: "keepHistory",
        useViewTitleAsBackText: true,
        disableViewCache: true
    });

    AppPedidos4tAvi.app.currentViewModel = null;
    AppPedidos4tAvi.app.on("viewShown", function (e) {
        AppPedidos4tAvi.app.currentViewModel = e.viewInfo.model;
    });

    AppPedidos4tAvi.app.on("navigatingBack", function (e) {
        if (AppPedidos4tAvi.app.currentViewModel && AppPedidos4tAvi.app.currentViewModel.name == 'pedidoDetalhe') {
            if (AppPedidos4tAvi.app.currentViewModel.pedidoResumoExiste &&
                AppPedidos4tAvi.app.currentViewModel.pedidoResumoExiste() &&
                (AppPedidos4tAvi.app.currentViewModel.tipoOperacao() !== 'cons')) {
                e.cancel = true;

                var customDialog = DevExpress.ui.dialog.custom({
                    title: "Confirmar",
                    message: "Deseja realmente voltar ?",
                    toolbarItems: [
                        { text: "Sim", onClick: function () { return true; } },
                        { text: "Não", onClick: function () { return false; } }
                    ]
                });

                customDialog.show().done(function (dialogResult) {
                    if (dialogResult) {
                        AppPedidos4tAvi.app.currentViewModel = null;

                        if (AppPedidos4tAvi.config.offlineCache) {
                            db.data._ped4tHeader.update(1, { status: 'F' });
                            db.data._ped4tItems.clear();
                        }
                        
                        AppPedidos4tAvi.app.off("navigatingBack", onNavigatingBack);
                        AppPedidos4tAvi.app.back();
                        AppPedidos4tAvi.app.on("navigatingBack", onNavigatingBack);
                    };
                });

            } else {
                if (AppPedidos4tAvi.config.offlineCache) {
                    db.data._ped4tHeader.update(1, { status: 'F' });
                    db.data._ped4tItems.clear();
                };
            }
        }

    });

    $(window).unload(function() {
        AppPedidos4tAvi.app.saveState();
    });

    AppPedidos4tAvi.app.router.register(":view/:id", { view: startupView, id: undefined });
    AppPedidos4tAvi.app.on("viewShown", onViewShown);
    AppPedidos4tAvi.app.on("navigatingBack", onNavigatingBack);
    AppPedidos4tAvi.app.navigate();
});