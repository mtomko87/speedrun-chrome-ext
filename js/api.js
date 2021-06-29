class Api {

    constructor() {
        this.prefix = "https://www.speedrun.com/api/v1/";
    }

    async get(request, data = null) {
        var url = this.prefix + request;
        if (data) {
            url += "?";
            var params = [];
            for (const [key, value] of Object.entries(data)) {
                params.push(`${key}=${value}`);
            }
            url += params.join("&");
        }
        return await fetch(url).then(response => response.json()).then(json => json.data);
    }
}