AppPedidos4tAvi.login = function (params) {

    var _username = ko.observable('');
    var _password = ko.observable('');
    
    function clear() {
        _username('');
        _password('');
    }

    function setUserName(userName) {
        window.localStorage.setItem("app4tUserName", userName);
    };

    function getUserName() {
        return window.localStorage.getItem("app4tUserName");
    };

    function setFlgEsconderObsDataEntrega(flag) {
        window.localStorage.setItem("app4tObsDataEntrega", flag);
    };

    function login(args) {
        viewModel.loadingVisible(true);

        db.login(_username(), _password(),
            function (data) {
                viewModel.loadingVisible(false);

                setUserName(_username());

                setFlgEsconderObsDataEntrega(false);

                if (db.owner.app.canBack()) {
                    db.owner.app.back();
                };
            }, 
            function (err) {
                DevExpress.ui.notify('Falha na tentativa de autenticação', 'error', 3000);

                viewModel.loadingVisible(false);
            });
    }

    var viewModel = {
        viewShown: function () {            
            clear();
            _username(getUserName());
        },
        username: _username,
        password: _password,
        loginClick: login,
        loadingVisible: ko.observable(false),
        loadpanelMessage: ko.observable('Autenticando...'),
    };

    viewModel.loadOptions = {
        visible: viewModel.loadingVisible,
        message: viewModel.loadpanelMessage,
        closeOnOutsideClick: false
    };

    return viewModel;
};