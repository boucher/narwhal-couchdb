var XMLHttpRequest = require("browser/xhr").XMLHttpRequest;

var util = require("util");

function HttpClient(){};

HttpClient.prototype = (function() {
    var ajaxOptions = function() {
        return {
            async: true,
            dataType: "json",
            type: "get",
            headers: [],
            binary: false
        };
    };
    return {
        _request: function(verb, uri, options) {
            var i, header;
            var opts = ajaxOptions();
            util.update(opts, options || {});
            opts.url = uri;
            opts.type = verb;

            var data = opts.data || "";
            if (["delete","get"].some(function(x) { return x === verb.toLowerCase(); })){
                data = undefined;
            }

            var req = new XMLHttpRequest();
            req.open(verb, uri, false);

            // Set headers
            for (i=0;i<opts.headers.length;++i) {
                header = opts.headers[i];
                req.setRequestHeader(header.label, header.value);
                print("set header -- " + header.label + " : " + header.value);
            };

            if (opts.binary) {
                req.sendAsBinary(data);
            } else {
                req.send(data);
            }

            if (req.status >= 200 && req.status < 400 && opts.success){
                var results = {
                    responseText: req.responseText,
                    status: req.status,
                    toString: function() { return this.responseText; }
                };

                if (results.status !== 304) {
                    if (opts.dataType && opts.dataType.toLowerCase() === "json"){
                        //results = JSON.parse(results);
                        eval("var results = " + results); // Is there a better way than eval?  JSON.parse is way slower.
                    } else if (opts.dataType && opts.dataType.toLowerCase() == "raw") {
                        results = req.responseRaw;
                    }
                }
                opts.success(results);
            } else if (opts.error) {
                 opts.error(req, req.responseText, req.status.toString());
            }

            if (typeof opts.complete === "function") {
                 opts.complete(req, req.status.toString());
            }
        },
        get: function(uri, options){
            this._request("GET", uri, options);
        },
        put: function(uri, options) {
            this._request("PUT", uri, options);
        },
        post: function(uri, options) {
            this._request("POST", uri, options);
        },
        del: function(uri, options) {
            this._request("DELETE", uri, options);
        }
    };
})();

exports.HttpClient = HttpClient;
