AppPedidos4tAvi.inicio = function (params) {
    var loginInfoIsReady = $.Deferred();

    function viewShownEvent() {
        //console.log(db.authenticated());
        //console.log(db.username);

        if (db.username == '') {
            //db.username está sendo usado para determinar se é usuário logado ou não
            //db.authenticated() deveria fazer as vezes, ainda verificar de corrigir o código do Don Wibier

            //se não tem db.username, não está logado, navega forçadamente para login para autenticação
            viewModel.nomeVendedor("");
            viewModel.nomeAprovador("");

            AppPedidos4tAvi.app.navigate('login', { root: true });
        } else {
            //é usuário logado, 
            //consome a UsuarioAppPedidos para determinar nome do vendedor + utilizaCota(e / ou) + nome sub- vendedor / vendedor vinculado + nome do aprovador
            //faz $.expand no objeto db, para ficar disponível app wide como db.userInfo

            var currentUser = {
                userInfo: { nomeVendedor: '',
                            codigoVendedor: '',
                            utilizaCota: '',
                            codigoAprovador: '',
                            nomeAprovador: '',
                            codigoSubVendedor: '',
                            codigoVendedorVinculado: '',
                            relatoriosContagem: 0,
                            listaRelatorios: []
                }
            };

            //Caso especial de exceção:
            //coloca uma trailing slash, caso seja o usuário admin@4t.com.br, porque é formato de email
            //GET request tem que chegar como /api/UsuarioAppPedidos/admin%404t.com.br/
            //e não como /api/UsuarioAppPedidos/admin%404t.com.br

            var usernameAux = db.username

            if (db.username == 'admin@4t.com.br') {
                usernameAux = db.username + '/'
            };

            db.data.UsuarioAppPedidos.Datasource.store().byKey(usernameAux).done(function (data) {
                if (data) {
                    console.log(data);
                    //currentUser.userInfo.nomeVendedor = data.nomeVendedor;
                    //currentUser.userInfo.codigoVendedor = data.codigoVendedor; //'015'; 
                    //currentUser.userInfo.utilizaCota = data.utilizaCota;
                    currentUser.userInfo.codigoAprovador = data.codigoAprovador;
                    currentUser.userInfo.nomeAprovador = data.nomeAprovador;
                    currentUser.userInfo.codigoSubVendedor = data.codigoSubVendedor;
                    currentUser.userInfo.codigoVendedorVinculado = data.codigoVendedorVinculado;
                    currentUser.userInfo.nomeVendedorVinculado = data.nomeVendedorVinculado;
                    currentUser.userInfo.relatoriosContagem = data.relatoriosContagem;
                    currentUser.userInfo.listaRelatorios = data.listaRelatorios;

                    //Popula observables para tratamento de categorias: vendedor, sub-vendedor e 
                    viewModel.codigoVendedor(data.codigoVendedor);
                    viewModel.nomeVendedor(data.nomeVendedor);

                    viewModel.codigoSubVendedor(data.codigoSubVendedor);
                    viewModel.codigoVendedorVinculado(data.codigoVendedorVinculado);
                    viewModel.nomeVendedorVinculado(data.nomeVendedorVinculado);

                    viewModel.codigoAprovador(data.codigoAprovador);
                    viewModel.nomeAprovador(data.nomeAprovador);

                    //Complementa a currentUser.userInfo com conteúdo de outras ko.computeds que determinam se se trata de vendedor ou sub-vendedor
                    currentUser.userInfo.perfilVendedor = viewModel.perfilVendedor();
                    currentUser.userInfo.perfilSubVendedor = viewModel.perfilSubVendedor();

                    //Resolve dados de propriedades referentes a vendedor de modo dinâmico
                    //Para representar o vendedor OU sub-vendedor e carregar isso app-wide no
                    //Objeto db.userInfo, não quebrando o fato de existir parâmetro central = codVendedor
                    //Sendo passado sempre para cada view
                    if (currentUser.userInfo.perfilVendedor) {
                        currentUser.userInfo.nomeVendedor = data.nomeVendedor;
                        currentUser.userInfo.codigoVendedor = data.codigoVendedor; //'015'; 
                        currentUser.userInfo.utilizaCota = data.utilizaCota;
                    } else if (currentUser.userInfo.perfilSubVendedor) {
                        currentUser.userInfo.nomeVendedor = data.nomeVendedorVinculado;
                        currentUser.userInfo.codigoVendedor = data.codigoVendedorVinculado; //'015'; 
                        currentUser.userInfo.utilizaCota = false;
                    };

                    //db.userInfo:
                    //Em caso de Vendedor:
                    //db.userInfo.codigoVendedor = código representante principal (default)
                    //db.userInfo.nomeVendedor = nome representante principal
                    //db.userInfo.codigoSubVendedor = ""
                    //db.userInfo.perfilVendedor = true
                    //db.userInfo.perfilSubVendedor = false


                    //Em caso de Sub-Vendedor:
                    //db.userInfo.codigoVendedor = código representante principal (default)
                    //db.userInfo.nomeVendedor = nome representante principal
                    //db.userInfo.codigoSubVendedor = código interno único alfanumérico para indicar sub-vendedor
                    //db.userInfo.perfilVendedor = false
                    //db.userInfo.perfilSubVendedor = true

                    $.extend(db, currentUser);


                    viewModel.relatoriosContagem(db.userInfo.relatoriosContagem);

                    //Habilita dinamicamente todos os itens de navegação
                    //Desde o SEGUNDO até O ANTE PENÚLTIMO
                    //AppPedidos4tAvi.app.navigation[0] = reservado para view Início
                    //AppPedidos4tAvi.app.navigation[AppPedidos4tAvi.app.navigation.length - 2] - reservado para Sobre
                    //AppPedidos4tAvi.app.navigation[AppPedidos4tAvi.app.navigation.length - 1] - reservado para Sair = Logout()
                    //console.log(AppPedidos4tAvi.app.navigation);

                    for (var i = 1; i < AppPedidos4tAvi.app.navigation.length - 2; i++) {
                        switch (i) {
                            case 1:
                                //Pedidos
                                if (viewModel.perfilVendedor() || viewModel.perfilSubVendedor()) {
                                    AppPedidos4tAvi.app.navigation[i].option('visible', true);
                                };
                                break;
                            case 2:
                                //Liberação
                                if (viewModel.perfilAprovador()) {
                                    AppPedidos4tAvi.app.navigation[i].option('visible', true);
                                };
                                break;
                            case 3:
                                //Relatórios
                                if (viewModel.relatoriosContagem() > 0) {
                                    AppPedidos4tAvi.app.navigation[i].option('visible', true);
                                };
                                break;
                            default:
                                AppPedidos4tAvi.app.navigation[i].option('visible', false);
                        };
                    };

                    loginInfoIsReady.resolve();
                } else {
                    //não retornou dados, não pode prosseguir, não há informação de quem é o vendedor e/ou aprovador

                };
            });

        }
    }

    var viewModel = {
        codigoVendedor: ko.observable(),
        nomeVendedor: ko.observable(),
        codigoAprovador: ko.observable(),
        nomeAprovador: ko.observable(),
        codigoSubVendedor: ko.observable(),
        codigoVendedorVinculado: ko.observable(),
        nomeVendedorVinculado: ko.observable(),
        relatoriosContagem: ko.observable(),
        viewShown: viewShownEvent,
        loginInfoIsReady: loginInfoIsReady.promise(),
        deferRenderingOptions: {
            showLoadIndicator: true,
            renderWhen: true,
            animation: 'fade'
        }
    };

    viewModel.perfilVendedor = ko.computed(function () {
        //Determina se o usuário tem perfil de vendedor, para seletivamente mostrar itens de menu
        var returnValue = false;

        if (viewModel.codigoVendedor() && viewModel.codigoVendedor() !== '') {
            returnValue = true;
        };

        return returnValue;
    });

    viewModel.perfilSubVendedor = ko.computed(function () {
        //Determina se o usuário tem perfil de sub-vendedor, para seletivamente mostrar itens de menu
        var returnValue = false;

        if (viewModel.codigoSubVendedor() && viewModel.codigoVendedorVinculado()) {
            returnValue = true;
        };

        return returnValue;
    });

    viewModel.perfilAprovador = ko.computed(function () {
        //Determina se o usuário tem perfil de aprovador, para seletivamente mostrar itens de menu
        var returnValue = false;

        if (viewModel.codigoAprovador() && viewModel.codigoAprovador() !== '') {
            returnValue = true;
        };

        return returnValue;
    });

    return viewModel;
};