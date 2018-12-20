// NOTE object below must be a valid JSON
//-http://localhost:13304/
//-https://bi.laticiniosaviacao.com.br/biaviacaodesenv/
window.AppPedidos4tAvi = $.extend(true, window.AppPedidos4tAvi, {
    "config": {
        "endpoints": {
            "db": {
                "local": "https://bi.laticiniosaviacao.com.br/biaviacao/",
                "production": "https://bi.laticiniosaviacao.com.br/biaviacao/"
            }
        },
        "services": {
            "db": {
                "entities": {
                }
            }
        }
    }
});
