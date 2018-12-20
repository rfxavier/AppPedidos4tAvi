// NOTE object below must be a valid JSON
//-http://localhost:13304/
//-https://bi.laticiniosaviacao.com.br/biaviacaodesenv/
window.AppPedidos4tAvi = $.extend(true, window.AppPedidos4tAvi, {
    "config": {
        "endpoints": {
            "db": {
                "local": "http://localhost:13304/",
                "production": "http://localhost:13304/"
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
