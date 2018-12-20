AppPedidos4tAvi.pedidoDetalhe = function (params) {
    var infoIsReady = $.Deferred();

    var arrayProdutos = [],
        objetoPedidoIcmsSt = ko.observable({}),
        mappedArrayProdutos = ko.observableArray([]),
        dataSourceAccordion = ko.observableArray([]),
        dataSourceAccordionNFsVenda = ko.observableArray([]),
        now = new Date(),
        mostrarIcmsSt = ko.observable(false),
        clienteInfoFetchNecessario = ko.observable(true);

    var produtoGrupos = function (data) {
        var self = this;

        self.B1_GRUPO = ko.observable(data.B1_GRUPO);
        self.B1_GRUPO_DESC = ko.observable(data.B1_GRUPO_DESC);

        self.items = ko.observableArray($.map(data.items, function (item) {
            return new produtoItems(item);
        }));

        self.totalGrupo = ko.computed(function () {
            var sum = 0;
            ko.utils.arrayForEach(self.items(), function (item) {
                sum += item.prodTotalComputed();
            })
            return sum;
        });

        self.totalGrupoDisp = ko.computed(function () {
            return self.totalGrupo().formatMoney(2, ',', '.');
        });

        self.totalGrupoDispReais = ko.computed(function () {
            return "R$ " + self.totalGrupo().formatMoney(2, ',', '.');
        });

        self.totalGrupoCaixa = ko.computed(function () {
            var sum = 0;
            ko.utils.arrayForEach(self.items(), function (item) {
                sum += item.prodTotalCaixaComputed();
            })
            return sum;
        });

        self.totalGrupoCaixaDisp = ko.computed(function () {
            return self.totalGrupoCaixa().formatMoney(2, ',', '.');
        });

        self.totalGrupoCaixaDispReais = ko.computed(function () {
            return "R$ " + self.totalGrupoCaixa().formatMoney(2, ',', '.');
        });

    };

    var produtoItems = function (data) {
        var self = this;

        self.B1_COD = ko.observable(data.B1_COD);
        self.B1_CONV = ko.observable(data.B1_CONV);
        self.B1_DESC = ko.observable(data.B1_DESC);
        self.ZZO_DESCRI = ko.observable(data.ZZO_DESCRI);
        self.ZZO_DESCRI_DISP = ko.observable(data.ZZO_DESCRI_DISP);
        self.B1_TIPCONV = ko.observable(data.B1_TIPCONV);
        self.B1_ZZPESOP = ko.observable(data.B1_ZZPESOP);
        self.DA1_PRCVEN = ko.observable(data.DA1_PRCVEN);
        self.DA1_PRCVEN_DISP = ko.observable(data.DA1_PRCVEN_DISP);
        self.DA1_PRCVEN_DISP_REAIS = ko.observable(data.DA1_PRCVEN_DISP_REAIS);
        self.PRECO_CAIXA = ko.observable(data.PRECO_CAIXA);
        self.PRECO_CAIXA_DISP = ko.observable(data.PRECO_CAIXA_DISP);
        self.PRECO_CAIXA_DISP_REAIS = ko.observable(data.PRECO_CAIXA_DISP_REAIS);
        self.SP_STATUS = ko.observable(data.SP_STATUS);
        self.ZP_SALDO = ko.observable(data.ZP_SALDO);
        self.prodObsBase = ko.observable(data.prodObsBase);
        self.prodObs = ko.observable(data.prodObs);
        self.prodQuantBase = ko.observable(data.prodQuantBase);
        self.prodQuant = ko.observable(data.prodQuant);

        //tratamento subscribe prodQuant observable
        self.prodQuant.subscribe(function (newValue) {
            if (AppPedidos4tAvi.config.offlineCache) {
                //console.log(self.B1_COD() + ' quant:' + newValue);

                if (newValue == null) {
                    db.data._ped4tItems.remove(self.B1_COD());
                    self.prodObs('');
                } else {
                    db.data._ped4tItems.insert({ id: self.B1_COD(), B1_COD: self.B1_COD(), prodQuant: newValue })
                        .fail(function (error) {
                            //console.log(error.message);
                            db.data._ped4tItems.update(self.B1_COD(), { B1_COD: self.B1_COD(), prodQuant: newValue });
                        });
                };

            };
        });

        //tratamento subscribe prodObs observable
        self.prodObs.subscribe(function (newValue) {
            if (AppPedidos4tAvi.config.offlineCache) {
                //console.log(self.B1_COD() + ' obs:' + newValue);

                db.data._ped4tItems.update(self.B1_COD(), { B1_COD: self.B1_COD(), prodObs: newValue });
            };
        });


        self.prodTotalComputed = ko.computed(function () {
            return (self.DA1_PRCVEN() * self.prodQuant());
        });
        self.prodTotalComputedDisp = ko.computed(function () {
            return self.prodTotalComputed().formatMoney(2, ',', '.');
        });
        self.prodTotalComputedDispReais = ko.computed(function () {
            return "R$ " + self.prodTotalComputed().formatMoney(2, ',', '.');
        });
        self.prodTotalCaixaComputed = ko.computed(function () {
            return (self.PRECO_CAIXA() * self.prodQuant());
        });
        self.prodTotalCaixaComputedDisp = ko.computed(function () {
            return self.prodTotalCaixaComputed().formatMoney(2, ',', '.');
        });
        self.prodTotalCaixaComputedDispReais = ko.computed(function () {
            return "R$ " + self.prodTotalCaixaComputed().formatMoney(2, ',', '.');
        });
        self.styleBackColor = ko.computed(function () {
            var color = "white";


            if (self.prodQuant() !== null) {
                if (self.prodQuant().toString() !== "0") {
                    if (viewModel.utilizaCota == '1' && (self.prodQuant() > self.ZP_SALDO())) {
                        color = "#F08080";
                    } else {
                        color = "#FFFF99";
                    };
                }
            }
            return color;
        });
    };

    var pedidoResumoObjectAux = function () {
        var totalProd = 0;
        var totalProdCaixa = 0;
        var foraCota = 0;
        var arrayResumo = [];

        for (var i = 0; i < dataSourceAccordion().length; i++) {
            for (var j = 0; j < dataSourceAccordion()[i].items().length; j++) {
                if (dataSourceAccordion()[i].items()[j].prodQuant() !== null) {
                    if (dataSourceAccordion()[i].items()[j].prodQuant().toString() !== "0") {
                        //Tem quantidade digitada, vai fazer parte do arrayResumo
                        arrayResumo.push({
                            B1_COD: dataSourceAccordion()[i].items()[j].B1_COD,
                            B1_DESC: dataSourceAccordion()[i].items()[j].B1_DESC,
                            ZZO_DESCRI: dataSourceAccordion()[i].items()[j].ZZO_DESCRI,
                            DA1_PRCVEN: dataSourceAccordion()[i].items()[j].DA1_PRCVEN,
                            DA1_PRCVEN_DISP: dataSourceAccordion()[i].items()[j].DA1_PRCVEN_DISP,
                            PRECO_CAIXA: dataSourceAccordion()[i].items()[j].PRECO_CAIXA,
                            PRECO_CAIXA_DISP: dataSourceAccordion()[i].items()[j].PRECO_CAIXA_DISP,
                            prodObs: dataSourceAccordion()[i].items()[j].prodObs(),
                            prodQuant: dataSourceAccordion()[i].items()[j].prodQuant(),
                            prodTotal: (dataSourceAccordion()[i].items()[j].prodQuant() * dataSourceAccordion()[i].items()[j].DA1_PRCVEN()).formatMoney(2, ',', '.'),
                            prodTotalCaixa: (dataSourceAccordion()[i].items()[j].prodQuant() * dataSourceAccordion()[i].items()[j].PRECO_CAIXA()).formatMoney(2, ',', '.'),
                            prodTotalCaixaNumber: dataSourceAccordion()[i].items()[j].prodQuant() * dataSourceAccordion()[i].items()[j].PRECO_CAIXA(),
                            prodTotalDisplay: ko.observable()
                        })

                        totalProd += dataSourceAccordion()[i].items()[j].prodQuant() * dataSourceAccordion()[i].items()[j].DA1_PRCVEN();
                        totalProdCaixa += dataSourceAccordion()[i].items()[j].prodQuant() * dataSourceAccordion()[i].items()[j].PRECO_CAIXA();
                        if (dataSourceAccordion()[i].items()[j].prodQuant() > dataSourceAccordion()[i].items()[j].ZP_SALDO()) {
                            foraCota += 1;
                            console.log('fora');
                        };
                        //dentroCota = dentroCota && (dataSourceAccordion()[i].items()[j].prodQuant() <= dataSourceAccordion()[i].items()[j].ZP_SALDO());
                    };
                };
            }
        }

        return {
            totalPedido: totalProd,
            totalPedidoDisp: totalProd.formatMoney(2, ',', '.'),
            totalPedidoCaixa: totalProdCaixa,
            totalPedidoCaixaDisp: totalProdCaixa.formatMoney(2, ',', '.'),
            foraCota: foraCota,
            arrayResumo: arrayResumo
        }
    };

    var valorIcmsSubstProduto = function (codProduto, arrayPedidoIcmsSt) {
        var valorIcmsSubstDisplay = "0,00"

        if (arrayPedidoIcmsSt) {
            var produtoInfoIcmsSt = $.grep(arrayPedidoIcmsSt, function (e) { return e.B1_COD == codProduto; });

            if (produtoInfoIcmsSt.length > 0) {
                valorIcmsSubstDisplay = produtoInfoIcmsSt[0].prodValorSubstTrib.formatMoney(2, ',', '.');
            };
        };

        return valorIcmsSubstDisplay;
    };

    var clienteInfo = function (data) {
        self = this;

        self.A1_COD = data.A1_COD;
        self.A1_NOME = data.A1_NOME;
        self.A1_LOJA = data.A1_LOJA;
        self.A1_VEND = data.A1_VEND;
        self.A1_TABELA = data.A1_TABELA;
        self.A1_COND = data.A1_COND;
        self.A1_METR = data.A1_METR;
        self.A1_NROCOM = data.A1_NROCOM;
        self.A1_ULTCOM = data.A1_ULTCOM;
        self.A1_SALDUP = data.A1_SALDUP;
        
        self.A1_ULTCOM_DISP = ko.computed(function () {
            if (self.A1_ULTCOM == "0001-01-01T00:00:00") {
                return ""
            } else {
                return new Date(self.A1_ULTCOM).ddmmyyyy()
            };
        });

        self.A1_SALDUP_DISP = ko.computed(function () {
            return self.A1_SALDUP.formatMoney(2, ',', '.');
        });

        self.itemsNFsVenda = $.map(data.itemsNFsVenda, function (item) {
            return new clienteInfoItemsNFsVenda(item);
        });
        //self.itemsNFsVenda = data.itemsNFsVenda;
    };

    var clienteInfoItemsNFsVenda = function (data) {
        self = this;

        self.pNUMERO_NF = data.pNUMERO_NF;
        self.pDATA_EMISSAO = data.pDATA_EMISSAO;
        self.pTOTAL_VL_PRODUTO = data.pTOTAL_VL_PRODUTO;

        self.pDATA_EMISSAO_DISP = new Date(self.pDATA_EMISSAO).ddmmyyyy();
        self.pNUMERO_NF_DISP = '(NF ' + self.pNUMERO_NF + ')';
        self.pTOTAL_VL_PRODUTO_DISP = self.pTOTAL_VL_PRODUTO.formatMoney(2, ',', '.')

        self.items = $.map(data.items, function (item) {
            return new clienteInfoItemsNFsVendaItems(item);
        });

        //self.items = new clienteInfoItemsNFsVendaItems(data.items);
    };

    var clienteInfoItemsNFsVendaItems = function (data) {
        self = this;

        self.pPRODUTO = data.pPRODUTO;
        self.pDESCRICAO = data.pDESCRICAO;
        self.pTOTAL_QTD_CX = data.pTOTAL_QTD_CX;
        self.pTOTAL_QTD_UN = data.pTOTAL_QTD_UN;
        self.pTOTAL_VL_PRODUTO = data.pTOTAL_VL_PRODUTO;

        self.pTOTAL_QTD_CX_DISP = self.pTOTAL_QTD_CX.formatMoney(0, ',', '.');

        self.pTOTAL_QTD_UN_DISP = self.pTOTAL_QTD_UN.formatMoney(0, ',', '.');

        self.pTOTAL_VL_PRODUTO_DISP = self.pTOTAL_VL_PRODUTO.formatMoney(2, ',', '.');

    };

    function viewShownEvent() {
        //params deve chegar aqui nessa view com a seguinte estrutura:
        //id: {
        //        codVendedor: '999',
        //        utilizaCota: '9',  //1=Utiliza Cota; 2=Não Utiliza Cota 
        //        codSubVendedor: 'XXXXX',
        //        codCliente: '99999',
        //        nomeCliente: 'XXXXX',
        //        endCliente: 'XXXXX',
        //        codLoja: '99',
        //        navToView: 'xxxx',
        //        tipoOperacao: 'ins', 'alt', 'cons' ou 'dup'
        //        numeroPedido: 99999    //no caso de tipoOperacao = 'ins' ou 'dup', passar numeroPedido = 0
        //}

        viewModel.tipoOperacao(params.id.tipoOperacao);
        if (viewModel.tipoOperacao() == 'cons') {
            viewModel.navbar.selectedIndex(1);
        } else {
            viewModel.navbar.selectedIndex(0);
        };
        console.log(db.userInfo.codSubVendedor);
        if (viewModel.tipoOperacao() == 'alt' && (!db.userInfo.codigoSubVendedor)) {
            //É operação Continuar (alt), de um representante principal?
            //O usuário logado no momento tentando continuar, é um representante principal?
            //Só deixa Fechar e Enviar, obrigatoriamente
            viewModel.deveSalvarEmAberto(false);
            viewModel.deveFecharEnviar(true);
        } else {
            viewModel.deveSalvarEmAberto(params.id.codSubVendedor);
            viewModel.deveFecharEnviar(!params.id.codSubVendedor);
        };


        //array com propriedades "plain", para receber modelo do backend 
        arrayProdutos = [];

        db.data.Produto.Datasource.group({ field: "B1_GRUPO" });
        db.data.Produto.Datasource.filter([["A1_COD", "=", params.id.codCliente], "and", ["A1_LOJA", "=", params.id.codLoja], "and", ["A1_VEND", "=", params.id.codVendedor]]);

        db.data.Produto.Datasource.load()
            .done(function (data) {
                for (var i = 0; i < data.length; i++) {
                    for (var j = 0; j < data[i].items.length; j++) {
                        var prodDescDisp,
                            prodPrecoDisp,
                            prodPrecoDispReais,
                            prodPrecoCaixaDisp,
                            prodPrecoCaixaDispReais,
                            prodQuant,
                            prodObs

                        if ((data[i].items[j].SP_STATUS == '1') && (viewModel.utilizaCota == '1')) {
                            prodDescDisp = data[i].items[j].ZZO_DESCRI + ' (' + data[i].items[j].ZP_SALDO.formatMoney(0, ',', '.') + ') ';
                        } else {
                            prodDescDisp = data[i].items[j].ZZO_DESCRI + ' ';
                        };

                        prodPrecoDisp = data[i].items[j].DA1_PRCVEN.formatMoney(2, ',', '.');
                        prodPrecoDispReais = 'R$ ' + data[i].items[j].DA1_PRCVEN.formatMoney(2, ',', '.');

                        prodPrecoCaixaDisp = data[i].items[j].PRECO_CAIXA.formatMoney(2, ',', '.');
                        prodPrecoCaixaDispReais = 'R$ ' + data[i].items[j].PRECO_CAIXA.formatMoney(2, ',', '.');

                        //coloca novas propriedades no array, que não são entregues pelo backend
                        $.extend(data[i].items[j], {
                            ZZO_DESCRI_DISP: prodDescDisp,
                            DA1_PRCVEN_DISP: prodPrecoDisp,
                            DA1_PRCVEN_DISP_REAIS: prodPrecoDispReais,
                            PRECO_CAIXA_DISP: prodPrecoCaixaDisp,
                            PRECO_CAIXA_DISP_REAIS: prodPrecoCaixaDispReais,
                            prodQuantBase: 0,
                            prodQuant: null,
                            prodObsBase: '',
                            prodObs: ''
                        });
                    }

                    arrayProdutos.push(data[i]);
                };

                //Mapeia array de propriedades plain para propriedades observable
                //fazendo na forma de constructor do objeto produtoGrupos, que tem nele a "hierarquia" para produtoItems
                mappedArrayProdutos = $.map(arrayProdutos, function (data) {
                    return new produtoGrupos(data);
                });

                //Se for alteração ou consulta de pedido, fazer merge de informações gravadas no pedido com o "catálogo" 
                //de produtos que é trazido pelo backend no controller Produtos
                if (viewModel.tipoOperacao() == 'alt' || viewModel.tipoOperacao() == 'cons' || viewModel.tipoOperacao() == 'dup') {
                    //Pedido é alteração, consulta ou duplicação, seta número do pedido

                    if (viewModel.tipoOperacao() == 'dup') {
                        viewModel.pedidoNumero(0);
                    } else {
                        viewModel.pedidoNumero(params.id.numeroPedido);
                    };

                    //Busca pedido do backend
                    db.data.Pedido.Datasource.store().byKey(params.id.numeroPedido)
                        .done(function (pedido) {
                            if (pedido) {
                                //console.log(pedido);
                                //Percorre todos os itens do "catálogo" de produtos que é o datasource do Accordion
                                for (var i = 0; i < mappedArrayProdutos.length; i++) {
                                    for (var j = 0; j < mappedArrayProdutos[i].items().length; j++) {

                                        //Busca informações dentro do .items do pedido resgatado do backend
                                        //Tomando por base o código de produto atual = B1_COD
                                        var pedidoItemPorCodigoProduto = $.grep(pedido.items, function (e) { return e.B1_COD == mappedArrayProdutos[i].items()[j].B1_COD(); });

                                        //console.log(pedidoItemPorCodigoProduto);

                                        if (pedidoItemPorCodigoProduto.length > 0) {
                                            //console.log('achei ' + mappedArrayProdutos[i].items()[j].B1_COD());

                                            mappedArrayProdutos[i].items()[j].prodQuant(pedidoItemPorCodigoProduto[0].prodQuant);
                                            mappedArrayProdutos[i].items()[j].prodObs(pedidoItemPorCodigoProduto[0].prodObs);
                                        } else {
                                            //console.log('não achei ' + mappedArrayProdutos[i].items()[j].B1_COD());
                                        };
                                    }
                                }

                                //Após fazer o "merge" dos itens do pedido consultado no backend ao catálogo
                                //mappedArrayProdutos vai conter o catálogo + as quantidades de cada produto alteradas de null para quantidade do produto no pedido
                                //Aplica-se então esse mappedArrayProdutos ao datasource do dxAccordion
                                dataSourceAccordion(mappedArrayProdutos);

                                //Caso a operação for 'cons' = consulta
                                //faz a busca por informações de icms st
                                //feito neste ponto, neste momento do código especificamente para consulta, porque
                                //precisa da promise resolvida já db.data.Pedido.Datasource.store().byKey
                                //para corretamente ter o catálogo "mergeado", consequentemente, ter viewModel.pedidosResumoArrayIcmsStPayload() apurado corretamente
                                if (viewModel.tipoOperacao() == 'cons') {
                                    //Consome controller PedidoSubstTrib
                                    db.data.PedidoSubstTrib.insert(viewModel.pedidosResumoArrayIcmsStPayload())
                                        .done(function (data) {
                                            objetoPedidoIcmsSt(data);
                                        });
                                };

                                if (viewModel.tipoOperacao() !== 'dup') {
                                    viewModel.pedidoNumeroCliente(pedido.numPedidoCliente);
                                    
                                    if (pedido.dataEntrega !== "0001-01-01T00:00:00") {
                                        //Transforma JSON date string em JavaScript Date() ignorando a timezone
                                        var date = new Date(pedido.dataEntrega)
                                        var userTimezoneOffset = date.getTimezoneOffset() * 60000;


                                        viewModel.pedidoDataEntrega(new Date(date.getTime() + userTimezoneOffset));
                                    };

                                    viewModel.pedidoObservacao(pedido.observacao);
                                }
                            };
                        });
                } else if (viewModel.tipoOperacao() == 'restore') {
                    //Caso a operação for 'restore' = recuperação de pedido de cache offline
                    //Busca pedido de db.data._pedido4tHeader e db.data._pedido4tItems

                    db.data._ped4tItems.load().done(function (data) {
                        if (data.length) {
                            //Percorre todos os itens do "catálogo" de produtos que é o datasource do Accordion
                            for (var i = 0; i < mappedArrayProdutos.length; i++) {
                                for (var j = 0; j < mappedArrayProdutos[i].items().length; j++) {

                                    //Busca informações dentro do _pedido4tItems resgatado do offline
                                    //Tomando por base o código de produto atual = B1_COD
                                    var pedidoItemPorCodigoProduto = $.grep(data, function (e) { return e.B1_COD == mappedArrayProdutos[i].items()[j].B1_COD(); });

                                    //console.log(pedidoItemPorCodigoProduto);

                                    if (pedidoItemPorCodigoProduto.length > 0) {
                                        //console.log('achei ' + mappedArrayProdutos[i].items()[j].B1_COD());

                                        mappedArrayProdutos[i].items()[j].prodQuant(pedidoItemPorCodigoProduto[0].prodQuant);
                                        mappedArrayProdutos[i].items()[j].prodObs(pedidoItemPorCodigoProduto[0].prodObs == undefined ? '' : pedidoItemPorCodigoProduto[0].prodObs);
                                    } else {
                                        //console.log('não achei ' + mappedArrayProdutos[i].items()[j].B1_COD());
                                    };
                                }
                            };
                        };

                        //Após fazer o "merge" dos itens do pedido consultado no offline ao catálogo
                        //mappedArrayProdutos vai conter o catálogo + as quantidades de cada produto alteradas de null para quantidade do produto no pedido
                        //Aplica-se então esse mappedArrayProdutos ao datasource do dxAccordion
                        dataSourceAccordion(mappedArrayProdutos);

                        //Caso a operação for 'cons' = consulta
                        //faz a busca por informações de icms st
                        //feito neste ponto, neste momento do código especificamente para consulta, porque
                        //precisa da promise resolvida já db.data.Pedido.Datasource.store().byKey
                        //para corretamente ter o catálogo "mergeado", consequentemente, ter viewModel.pedidosResumoArrayIcmsStPayload() apurado corretamente
                        if (viewModel.tipoOperacao() == 'cons') {
                            //Consome controller PedidoSubstTrib
                            db.data.PedidoSubstTrib.insert(viewModel.pedidosResumoArrayIcmsStPayload())
                                .done(function (data) {
                                    objetoPedidoIcmsSt(data);
                                });
                        };

                        db.data._ped4tHeader.load().done(function (data) {
                            if (data.length) {
                                viewModel.pedidoNumeroCliente(data[0].numPedidoCliente);

                                if (data[0].dataEntrega !== "0001-01-01T00:00:00") {
                                    viewModel.pedidoDataEntrega(data[0].dataEntrega);
                                };

                                viewModel.pedidoObservacao(data[0].observacao);

                            };
                        });
                    });
                } else if (viewModel.tipoOperacao() == 'ins') {
                    //Caso a operação for 'ins' = inserção
                    //aplica-se o catálogo diretamente apurado pela resolução da promise db.data.Produto.Datasource.load()
                    //que contém todas as quantidades de produto = null
                    dataSourceAccordion(mappedArrayProdutos);

                    //Pedido é novo, seta número do pedido = 0
                    viewModel.pedidoNumero(0);

                    //Pedido é novo, seta _ped4tHeader caso esteja habilitado o offlineCache
                    if (AppPedidos4tAvi.config.offlineCache) {
                        db.data._ped4tHeader.update(1, {
                            codCliente: viewModel.codCliente,
                            codLoja: viewModel.codLoja,
                            codVendedor: viewModel.codVendedor,
                            utilizaCota: viewModel.utilizaCota,
                            nomeCliente: viewModel.nomeCliente,
                            endCliente: viewModel.endCliente,
                            dataEntrega: viewModel.pedidoDataEntrega(),
                            numPedidoCliente: viewModel.pedidoNumeroCliente(),
                            observacao: viewModel.pedidoObservacao(),
                            status: 'P'
                        });

                        db.data._ped4tItems.clear();
                    };
                };

                infoIsReady.resolve();
            });
    };

    var viewModel = {
        infoIsReady: infoIsReady.promise(),
        viewShown: viewShownEvent,
        codVendedor: params.id.codVendedor,
        codSubVendedor: params.id.codSubVendedor,
        codLoja: params.id.codLoja,
        codCliente: params.id.codCliente,
        nomeCliente: params.id.nomeCliente,
        endCliente: params.id.endCliente,
        cnpjCliente: params.id.cnpjCliente,
        utilizaCota: params.id.utilizaCota,
        tipoOperacao: ko.observable(''),
        deveSalvarEmAberto: ko.observable(false),
        deveFecharEnviar: ko.observable(false),
        accordionOptions: {
            height: 'auto',
            dataSource: dataSourceAccordion,
            noDataText: 'Não há informações disponíveis',
            selectedIndex: -1,
            animationDuration: 700,
            collapsible: true
        },
        accordionNFsVendaOptions: {
            height: 'auto',
            dataSource: dataSourceAccordionNFsVenda,
            noDataText: 'Não há informações disponíveis',
            selectedIndex: -1,
            animationDuration: 700,
            collapsible: true
        },
        visiblePopupObsProd: ko.observable(false),
        visiblePopupDataEntrega: ko.observable(false),
        visiblePopupErrorServer: ko.observable(false),
        modelProdutoAtual: ko.observable({}),
        arrayProdutosResumo: [],
        clienteInfo: ko.observable({}),
        pedidoNumero: ko.observable(0),
        pedidoNumeroCliente: ko.observable(''),
        pedidoStatus: ko.observable('A'),
        pedidoDataEntrega: ko.observable(''),
        pedidoObservacao: ko.observable(''),
        loadingVisible: ko.observable(false),
        loadpanelMessage: ko.observable('Carregando...')
    };

    //tratamento subscribe pedidoDataEntrega observable
    viewModel.pedidoDataEntrega.subscribe(function (newValue) {
        if (AppPedidos4tAvi.config.offlineCache) {
            //console.log('data entrega:' + newValue);

            db.data._ped4tHeader.update(1, {
                dataEntrega: viewModel.pedidoDataEntrega()
            });
        };
    });

    //tratamento subscribe pedidoNumeroCliente observable
    viewModel.pedidoNumeroCliente.subscribe(function (newValue) {
        if (AppPedidos4tAvi.config.offlineCache) {
            //console.log('pedido cliente:' + newValue);

            db.data._ped4tHeader.update(1, {
                numPedidoCliente: viewModel.pedidoNumeroCliente()
            });
        };
    });

    //tratamento subscribe pedidoObservacao observable
    viewModel.pedidoObservacao.subscribe(function (newValue) {
        if (AppPedidos4tAvi.config.offlineCache) {
            //console.log('observação:' + newValue);

            db.data._ped4tHeader.update(1, {
                observacao: viewModel.pedidoObservacao()
            });
        };
    });

    viewModel.listOptions = function (data) {
        return {
            dataSource: data.items,
            pageLoadMode: 'scrollBottom'
        }
    };

    viewModel.numberboxQuantOptions = function (data) {
        return {
            value: data.prodQuant,
            placeholder: 'Quantidade',
            inputAttr: {pattern: '[0-9]*'},
            width: '30%',
            height: '30px',
            valueChangeEvent: 'keyup',
            step: 0,
            min: 0,
            max: ((data.SP_STATUS() == '1') && (viewModel.utilizaCota == '1')) ? data.ZP_SALDO : 9999
        }
    };

    viewModel.loadOptions = {
        visible: viewModel.loadingVisible,
        message: viewModel.loadpanelMessage,
        closeOnOutsideClick: false
    };

    viewModel.buttonObsProdOptions = {
        icon: 'comment',
        hint: 'Observação',
        onClick: function (e) {
            //console.log(e.model.prodObs() == '');
            viewModel.modelProdutoAtual(e.model);
            viewModel.visiblePopupObsProd(true);
        }
    };

    viewModel.buttonObsProdFecharOptions = {
        text: 'Ok',
        onClick: function (e) {
            viewModel.visiblePopupObsProd(false);
        }
    };

    viewModel.popupObsProdOptions = {
        width: 300,
        height: 230,
        showTitle: true,
        title: 'Observação',
        visible: viewModel.visiblePopupObsProd,
        dragEnabled: false,
        closeOnOutsideClick: true,
        showCloseButton: false
    };

    viewModel.textareaObsProdOptions = function (data) {
        return {
            value: data.prodObs,
            placeholder: 'Observação',
            valueChangeEvent: 'keyup',
            height: 110,
            maxLength: 30
        }
    };

    viewModel.dateboxDataEntregaOptions = {
        value: viewModel.pedidoDataEntrega,
        min: new Date(),
        displayFormat: 'dd/MM/yyyy',
        pickerType: "rollers",
        placeholder: 'Data Entrega',
        applyButtonText: 'Ok',
        cancelButtonText: 'Cancelar',
        showClearButton: true,
        onOpened: function (e) {
            if (!(getFlgEsconderObsDataEntrega() == "true")) {
                viewModel.visiblePopupDataEntrega(true);
            };
        }
    };

    viewModel.popupDataEntregaOptions = {
        width: 300,
        height: 150,
        showTitle: true,
        title: 'Observação',
        visible: viewModel.visiblePopupDataEntrega,
        dragEnabled: false,
        closeOnOutsideClick: false,
        showCloseButton: false
    };

    viewModel.buttonDataEntregaFecharOptions = {
        text: 'Ok',
        onClick: function (e) {
            viewModel.visiblePopupDataEntrega(false);
            setFlgEsconderObsDataEntrega(true);
        }
    };

    viewModel.popupErrorServerOptions = {
        width: 300,
        height: 150,
        showTitle: true,
        title: 'Observação',
        visible: viewModel.visiblePopupErrorServer,
        dragEnabled: false,
        closeOnOutsideClick: false,
        showCloseButton: false,
        shadingColor: 'red'
    };

    viewModel.buttonErrorServerFecharOptions = {
        text: 'Ok',
        onClick: function (e) {
            viewModel.visiblePopupErrorServer(false);

            //AppPedidos4tAvi.app.currentViewModel = null;
            //AppPedidos4tAvi.app.back();
        }
    };


    viewModel.textboxPedidoNumeroClienteOptions = {
        value: viewModel.pedidoNumeroCliente,
        valueChangeEvent: 'keyup',
        placeholder: 'Número Pedido Cliente'
    };

    viewModel.textareaPedidoObservacaoOptions = {
        value: viewModel.pedidoObservacao,
        valueChangeEvent: 'keyup',
        placeholder: 'Observação',
        height: 70
    };

    function setFlgEsconderObsDataEntrega(flag) {
        window.localStorage.setItem("app4tObsDataEntrega", flag);
    };

    function getFlgEsconderObsDataEntrega() {
        return window.localStorage.getItem("app4tObsDataEntrega");
    };

    function salvarPedido(e, flgStatus) {
        viewModel.loadpanelMessage('Enviando Informações');
        viewModel.loadingVisible(true);

        viewModel.pedidoStatus(flgStatus);

        db.data.Pedido.insert(viewModel.pedidosResumoArrayPayload())
            .done(function (data) {
                //Inserção ocorreu com sucesso, seta _ped4tHeader caso esteja habilitado o offlineCache
                //Status == F (Fechado)
                if (AppPedidos4tAvi.config.offlineCache) {
                    db.data._ped4tHeader.update(1, {
                        status: 'F'
                    });
                };


                //navega para view anterior, que é a clientes
                viewModel.loadingVisible(false);

                AppPedidos4tAvi.app.currentViewModel = null;
                AppPedidos4tAvi.app.back();
            })
            .fail(function (data) {
                //Ocorreu erro, mostra mensagem e volta
                viewModel.loadingVisible(false);

                viewModel.visiblePopupErrorServer(true);
            });

    };


    viewModel.numeroPedidoDisp = ko.computed(function () {
        if (viewModel.pedidoNumero() == 0) {
            if (viewModel.tipoOperacao() == 'restore') {
                return 'RECUPERADO'
            } else {
                return 'NOVO'
            }
        } else {
            return viewModel.pedidoNumero().toString()
        };
    });

    viewModel.nomeClienteDisp = ko.computed(function () {
        return 'Cliente: ' + viewModel.nomeCliente + ' ' + viewModel.codCliente + ' Lj: ' + viewModel.codLoja + (viewModel.endCliente == null ? '' : ' End: ' + viewModel.endCliente) + (viewModel.cnpjCliente == null ? '' : ' CNPJ: ' + viewModel.cnpjCliente);
    }),

    viewModel.textoVerIcmsStOuPreco = ko.computed(function () {
        return mostrarIcmsSt() ? 'Ver Preço' : 'Ver ST'
    });

    viewModel.buttonSwitchIcmsStOptions = {
        text: viewModel.textoVerIcmsStOuPreco,
        height: '20px',
        onClick: function () {
            mostrarIcmsSt(!mostrarIcmsSt())
        }
    };

    viewModel.pedidoResumoObject = ko.computed(function () {
        var _pedidoResumoObjectAux = new pedidoResumoObjectAux();

        return _pedidoResumoObjectAux;
    });

    viewModel.pedidoResumoArray = ko.computed(function () {
        var returnArray = [];

        if (viewModel.pedidoResumoObject()) {
            returnArray = viewModel.pedidoResumoObject().arrayResumo;
        };

        //prodTotalDisplay será o valor mostrado em subtotal de cada produto/item
        //Depende se é para mostrar o IcmsSt ou o preço total
        for (var i = 0; i < returnArray.length; i++) {
            if (mostrarIcmsSt()) {
                returnArray[i].prodTotalDisplay(valorIcmsSubstProduto(returnArray[i].B1_COD(), objetoPedidoIcmsSt() && objetoPedidoIcmsSt().items));
            }
            else
            {
                returnArray[i].prodTotalDisplay(returnArray[i].prodTotalCaixa);
            };
        };


        return returnArray;
    });


    viewModel.pedidoEstouroCota = ko.computed(function () {
        var returnValue = false;

        if (viewModel.utilizaCota == '1' && viewModel.pedidoResumoObject()) {
            returnValue = viewModel.pedidoResumoObject().foraCota > 0;
        };

        return returnValue;
    });

    //viewModel.deveSalvarEmAberto = ko.computed(function () {
    //    console.log(viewModel.codSubVendedor);
    //    return viewModel.codSubVendedor !== '';
    //});

    //viewModel.deveFecharEnviar = ko.computed(function () {
    //    console.log(viewModel.codSubVendedor);
    //    return viewModel.codSubVendedor == '';
    //});

    viewModel.buttonSalvarAbertoOptions = {
        text: 'Salvar em Aberto',
        //visible: viewModel.deveSalvarEmAberto(),
        onClick: function (e) {
            salvarPedido(e, 'A');
        }
    };

    viewModel.buttonFecharEnviarOptions = {
        text: 'Fechar e Enviar',
        //visible: viewModel.deveFecharEnviar(),
        onClick: function (e) {
            salvarPedido(e, 'E');
        }
    };

    viewModel.pedidoResumoExiste = ko.computed(function () {
        return (viewModel.pedidoResumoArray().length > 0);
    });

    viewModel.pedidosResumoArrayPayload = ko.computed(function () {
        var mappedArrayItems = $.map(viewModel.pedidoResumoArray(), function (data) {
            return {
                B1_COD: data.B1_COD(),
                prodObs: data.prodObs,
                prodQuant: data.prodQuant
            };
        });

        return {
            numPedido: viewModel.pedidoNumero(),
            codVendedor: viewModel.codVendedor,
            codSubVendedor: viewModel.codSubVendedor,
            codLoja: viewModel.codLoja,
            codCliente: viewModel.codCliente,
            status: viewModel.pedidoStatus(),
            numPedidoCliente: viewModel.pedidoNumeroCliente(),
            dataEntrega: viewModel.pedidoDataEntrega(),
            observacao: viewModel.pedidoObservacao(),
            items: mappedArrayItems
            };
    });

    viewModel.pedidosResumoArrayIcmsStPayload = ko.computed(function () {
        var mappedArrayItems = $.map(viewModel.pedidoResumoArray(), function (data) {
            return {
                B1_COD: data.B1_COD(),
                prodValorTotal: data.prodTotalCaixaNumber
            };
        });

        return {
            codVendedor: viewModel.codVendedor,
            codLoja: viewModel.codLoja,
            codCliente: viewModel.codCliente,
            items: mappedArrayItems
        };
    });

    viewModel.pedidoResumoValorIcmsSt = ko.computed(function () {
        if (objetoPedidoIcmsSt()) {
            return objetoPedidoIcmsSt().pedidoValorSubstTrib
        } else {
            return 0
        };
    });

    viewModel.pedidoResumoValorIcmsStDisp = ko.computed(function () {
        var returnValue = "0,00";

        if (viewModel.pedidoResumoValorIcmsSt()) {
            returnValue = viewModel.pedidoResumoValorIcmsSt().formatMoney(2, ',', '.')
        };
        return returnValue;
    });

    viewModel.pedidoResumoValorTotal = ko.computed(function () {
        var returnValue = 0;

        if (viewModel.pedidoResumoObject()) {
            returnValue = viewModel.pedidoResumoObject().totalPedido;
        };

        return returnValue;
    });

    viewModel.pedidoResumoValorTotalDisp = ko.computed(function () {
        var returnValue = "0,00";

        if (viewModel.pedidoResumoObject()) {
            returnValue = viewModel.pedidoResumoObject().totalPedidoDisp;
        };

        return returnValue;
    });

    viewModel.pedidoResumoValorTotalDispReais = ko.computed(function () {
        return "R$ " + viewModel.pedidoResumoValorTotalDisp();
    });

    viewModel.pedidoResumoValorTotalCaixa = ko.computed(function () {
        var returnValue = 0;

        if (viewModel.pedidoResumoObject()) {
            returnValue = viewModel.pedidoResumoObject().totalPedidoCaixa;
        };

        return returnValue;
    });

    viewModel.pedidoResumoValorTotalCaixaDisp = ko.computed(function () {
        var returnValue = "0,00";

        if (viewModel.pedidoResumoObject()) {
            returnValue = viewModel.pedidoResumoObject().totalPedidoCaixaDisp;
        };

        return returnValue;
    });

    viewModel.pedidoResumoValorTotalCaixaDispReais = ko.computed(function () {
        return "R$ " + viewModel.pedidoResumoValorTotalCaixaDisp();
    });

    viewModel.pedidoResumoValorTotalComIcmsSt = ko.computed(function () {
        return viewModel.pedidoResumoValorTotalCaixa() + viewModel.pedidoResumoValorIcmsSt();
    });

    viewModel.pedidoResumoValorTotalComIcmsStDisp = ko.computed(function () {
        var returnValue = "0,00";

        if (viewModel.pedidoResumoValorTotalComIcmsSt()) {
            returnValue = viewModel.pedidoResumoValorTotalComIcmsSt().formatMoney(2, ',', '.');
        };

        return returnValue;
    });

    viewModel.pedidoResumoValorTotalComIcmsStDispReais = ko.computed(function () {
        return "R$ " + viewModel.pedidoResumoValorTotalComIcmsSt();
    });

    viewModel.mostrarConformeTipoOperacao = ko.computed(function () {
        return viewModel.tipoOperacao() !== 'cons';
    });

    viewModel.navbar = {
        items: [
        { text: "Pedido", icon: "edit", visible: viewModel.mostrarConformeTipoOperacao },
        { text: "Resumo", icon: "cart", badge: function () { return viewModel.pedidoResumoValorTotalCaixaDispReais }() },
        { text: "Cliente", icon: "card" }
        ],
        selectedIndex: ko.observable(0)
    };

    viewModel.navbarOptions = {
        items: viewModel.navbar.items,
        selectedIndex: viewModel.navbar.selectedIndex,
        onItemClick: function (e) {
            if (e.itemIndex == 0) {
                //Entrou na aba de edição do pedido

            } else if (e.itemIndex == 1) {
                //Entrou na aba de resumo

                //Consome controller PedidoSubstTrib
                db.data.PedidoSubstTrib.insert(viewModel.pedidosResumoArrayIcmsStPayload())
                    .done(function (data) {
                        objetoPedidoIcmsSt(data);
                    });
            } else if (e.itemIndex == 2) {
                //Entrou na aba de informações do cliente

                if (clienteInfoFetchNecessario()) {
                    db.data.Cliente.Datasource.store().byKey(params.id.codCliente + params.id.codLoja)
                        .done(function (data) {
                            viewModel.clienteInfo(new clienteInfo(data));

                            dataSourceAccordionNFsVenda(viewModel.clienteInfo().itemsNFsVenda);
                            clienteInfoFetchNecessario(false);
                        });
                };
            };
        }
    };

    return viewModel;
};