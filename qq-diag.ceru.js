exports.manifest = {
  "manifestVersion": 2,
  "id": "ceru.mf.qqdiag",
  "name": "QQ诊断",
  "version": "1.9.26",
  "description": "由 MusicFree 插件适配：20（搜索/取链/歌词）",
  "author": "hebijunge (MF→Ceru 自动适配)",
  "engines": {
    "hostApi": "^2.0.0",
    "logicRuntime": "ceru-js@1"
  },
  "modules": {
    "logic": {
      "entry": "logic.main"
    }
  },
  "permissions": [
    {
      "key": "network",
      "name": "network.request",
      "reason": "音乐搜索、取链与歌词需要访问网络"
    }
  ],
  "contributes": {
    "providers": [
      {
        "id": "qqdiag",
        "name": "QQ诊断",
        "protocols": [
          "https",
          "http"
        ],
        "qualities": [
          "128k",
          "320k",
          "flac",
          "hires"
        ],
        "connectionMode": "none"
      }
    ],
    "playlistImporters": [
      {
        "id": "qqdiag-import",
        "title": "QQ诊断歌单/专辑",
        "providerId": "qqdiag",
        "placeholder": "粘贴QQ诊断歌单/专辑链接",
        "description": "由 MusicFree 插件 importMusicSheet 适配"
      }
    ]
  }
};
exports.activate = function (core) {
  'use strict';
  // ===== 注入宿主网络代理给 axios shim =====
  globalThis.__MF_HOST__ = {
    request: function (cfg) {
      return core.http.request({
        permissionKey: 'network',
        url: cfg.url,
        method: cfg.method,
        headers: cfg.headers,
        body: cfg.body,
        responseType: cfg.responseType,
        timeoutMs: cfg.timeoutMs || 20000,
        operation: cfg.operation || (globalThis.__MF_OP__ || {})
      });
    }
  };
  // ===== 运行打包后的 MF 插件，拿到 plugin 对象 =====
  var __MF_PLUGIN_BUNDLE__ = (() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // axios-shim.js
  var require_axios_shim = __commonJS({
    "axios-shim.js"(exports, module) {
      "use strict";
      function getHost() {
        var h = globalThis.__MF_HOST__;
        if (!h || typeof h.request !== "function") {
          throw new Error("[axios-shim] \u5BBF\u4E3B\u7F51\u7EDC\u672A\u6CE8\u5165\uFF08__MF_HOST__.request \u7F3A\u5931\uFF09");
        }
        return h;
      }
      function normalize(config) {
        config = config || {};
        var url = config.url || "";
        var method = String(config.method || "get").toLowerCase();
        var headers = config.headers || {};
        if (config.params) {
          var qs = [];
          Object.keys(config.params).forEach(function(k) {
            var v = config.params[k];
            if (v === void 0 || v === null) return;
            if (Array.isArray(v)) v.forEach(function(x) {
              qs.push(encodeURIComponent(k) + "=" + encodeURIComponent(x));
            });
            else qs.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
          });
          if (qs.length) url += (url.indexOf("?") >= 0 ? "&" : "?") + qs.join("&");
        }
        var body = config.data;
        if (body && typeof body === "object" && !(body instanceof ArrayBuffer) && typeof ArrayBuffer !== "undefined" && typeof body !== "string") {
          try {
            body = JSON.stringify(body);
            if (!headers["Content-Type"] && !headers["content-type"]) {
              headers = Object.assign({ "Content-Type": "application/json;charset=utf-8" }, headers);
            }
          } catch (e) {
          }
        }
        return {
          url,
          method,
          headers,
          body,
          responseType: config.responseType,
          timeoutMs: config.timeout,
          permissionKey: "network"
        };
      }
      function toAxiosResponse(res, config) {
        var data = res.body;
        if (typeof data === "string" && config.responseType !== "text" && config.responseType !== "arraybuffer") {
          try {
            data = JSON.parse(data);
          } catch (e) {
          }
        }
        return {
          data,
          status: res.status,
          statusText: String(res.status),
          headers: res.headers || {},
          config
        };
      }
      function request(config) {
        if (typeof config === "string") config = { url: config };
        var cfg = normalize(config);
        var host = getHost();
        return host.request(cfg).then(function(res) {
          try {
            if (typeof globalThis.__MF_HTTP_LOG__ === "undefined") globalThis.__MF_HTTP_LOG__ = [];
            var bd = res && res.body;
            var sig = "";
            if (bd && typeof bd === "object") {
              var rq = bd.req && bd.req.data && bd.req.data.body;
              sig = "code=" + (bd.req && bd.req.code) + " keys=" + (rq ? Object.keys(rq).slice(0, 5).join(",") : "nobody") + " item_song=" + !!(rq && rq.item_song);
            } else sig = "bodyType=" + typeof bd + " len=" + String(bd || "").length;
            globalThis.__MF_HTTP_LOG__.push(cfg.method + " " + cfg.url.slice(0, 40) + " status=" + (res && res.status) + " " + sig);
            if (globalThis.__MF_HTTP_LOG__.length > 20) globalThis.__MF_HTTP_LOG__.shift();
          } catch (e) {
          }
          return toAxiosResponse(res, config);
        }).catch(function(err) {
          try {
            if (typeof globalThis.__MF_HTTP_LOG__ === "undefined") globalThis.__MF_HTTP_LOG__ = [];
            globalThis.__MF_HTTP_LOG__.push("ERR " + cfg.url.slice(0, 40) + " " + String(err && err.message).slice(0, 50));
          } catch (e) {
          }
          throw err;
        });
      }
      function methodFactory(method) {
        return function(url, data, config) {
          config = Object.assign({}, config || {}, { url, method });
          if (method !== "get" && method !== "head") config.data = data;
          else if (data && !config.params) config.params = data;
          return request(config);
        };
      }
      var axios = {
        request,
        get: methodFactory("get"),
        delete: methodFactory("delete"),
        head: methodFactory("head"),
        options: methodFactory("options"),
        post: methodFactory("post"),
        put: methodFactory("put"),
        patch: methodFactory("patch"),
        defaults: { timeout: 2e3, headers: { common: {} } },
        interceptors: {
          request: { use: function() {
          }, eject: function() {
          } },
          response: { use: function() {
          }, eject: function() {
          } }
        },
        isAxiosError: function(e) {
          return !!(e && e.isAxiosError);
        }
      };
      axios.create = function() {
        return axios;
      };
      axios.all = function(arr) {
        return Promise.all(arr);
      };
      axios.spread = function(fn) {
        return function(arr) {
          return fn.apply(null, arr);
        };
      };
      module.exports = axios;
    }
  });

  // tools/node_modules/pako/lib/zlib/trees.js
  var require_trees = __commonJS({
    "tools/node_modules/pako/lib/zlib/trees.js"(exports, module) {
      "use strict";
      var Z_FIXED = 4;
      var Z_BINARY = 0;
      var Z_TEXT = 1;
      var Z_UNKNOWN = 2;
      function zero(buf) {
        let len = buf.length;
        while (--len >= 0) {
          buf[len] = 0;
        }
      }
      var STORED_BLOCK = 0;
      var STATIC_TREES = 1;
      var DYN_TREES = 2;
      var MIN_MATCH = 3;
      var MAX_MATCH = 258;
      var LENGTH_CODES = 29;
      var LITERALS = 256;
      var L_CODES = LITERALS + 1 + LENGTH_CODES;
      var D_CODES = 30;
      var BL_CODES = 19;
      var HEAP_SIZE = 2 * L_CODES + 1;
      var MAX_BITS = 15;
      var Buf_size = 16;
      var MAX_BL_BITS = 7;
      var END_BLOCK = 256;
      var REP_3_6 = 16;
      var REPZ_3_10 = 17;
      var REPZ_11_138 = 18;
      var extra_lbits = (
        /* extra bits for each length code */
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0])
      );
      var extra_dbits = (
        /* extra bits for each distance code */
        new Uint8Array([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13])
      );
      var extra_blbits = (
        /* extra bits for each bit length code */
        new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7])
      );
      var bl_order = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
      var DIST_CODE_LEN = 512;
      var static_ltree = new Array((L_CODES + 2) * 2);
      zero(static_ltree);
      var static_dtree = new Array(D_CODES * 2);
      zero(static_dtree);
      var _dist_code = new Array(DIST_CODE_LEN);
      zero(_dist_code);
      var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
      zero(_length_code);
      var base_length = new Array(LENGTH_CODES);
      zero(base_length);
      var base_dist = new Array(D_CODES);
      zero(base_dist);
      function StaticTreeDesc(static_tree, extra_bits, extra_base, elems, max_length) {
        this.static_tree = static_tree;
        this.extra_bits = extra_bits;
        this.extra_base = extra_base;
        this.elems = elems;
        this.max_length = max_length;
        this.has_stree = static_tree && static_tree.length;
      }
      var static_l_desc;
      var static_d_desc;
      var static_bl_desc;
      function TreeDesc(dyn_tree, stat_desc) {
        this.dyn_tree = dyn_tree;
        this.max_code = 0;
        this.stat_desc = stat_desc;
      }
      var d_code = (dist) => {
        return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
      };
      var put_short = (s, w) => {
        s.pending_buf[s.pending++] = w & 255;
        s.pending_buf[s.pending++] = w >>> 8 & 255;
      };
      var send_bits = (s, value, length) => {
        if (s.bi_valid > Buf_size - length) {
          s.bi_buf |= value << s.bi_valid & 65535;
          put_short(s, s.bi_buf);
          s.bi_buf = value >> Buf_size - s.bi_valid;
          s.bi_valid += length - Buf_size;
        } else {
          s.bi_buf |= value << s.bi_valid & 65535;
          s.bi_valid += length;
        }
      };
      var send_code = (s, c, tree) => {
        send_bits(
          s,
          tree[c * 2],
          tree[c * 2 + 1]
          /*.Len*/
        );
      };
      var bi_reverse = (code, len) => {
        let res = 0;
        do {
          res |= code & 1;
          code >>>= 1;
          res <<= 1;
        } while (--len > 0);
        return res >>> 1;
      };
      var bi_flush = (s) => {
        if (s.bi_valid === 16) {
          put_short(s, s.bi_buf);
          s.bi_buf = 0;
          s.bi_valid = 0;
        } else if (s.bi_valid >= 8) {
          s.pending_buf[s.pending++] = s.bi_buf & 255;
          s.bi_buf >>= 8;
          s.bi_valid -= 8;
        }
      };
      var gen_bitlen = (s, desc) => {
        const tree = desc.dyn_tree;
        const max_code = desc.max_code;
        const stree = desc.stat_desc.static_tree;
        const has_stree = desc.stat_desc.has_stree;
        const extra = desc.stat_desc.extra_bits;
        const base = desc.stat_desc.extra_base;
        const max_length = desc.stat_desc.max_length;
        let h;
        let n, m;
        let bits;
        let xbits;
        let f;
        let overflow = 0;
        for (bits = 0; bits <= MAX_BITS; bits++) {
          s.bl_count[bits] = 0;
        }
        tree[s.heap[s.heap_max] * 2 + 1] = 0;
        for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
          n = s.heap[h];
          bits = tree[tree[n * 2 + 1] * 2 + 1] + 1;
          if (bits > max_length) {
            bits = max_length;
            overflow++;
          }
          tree[n * 2 + 1] = bits;
          if (n > max_code) {
            continue;
          }
          s.bl_count[bits]++;
          xbits = 0;
          if (n >= base) {
            xbits = extra[n - base];
          }
          f = tree[n * 2];
          s.opt_len += f * (bits + xbits);
          if (has_stree) {
            s.static_len += f * (stree[n * 2 + 1] + xbits);
          }
        }
        if (overflow === 0) {
          return;
        }
        do {
          bits = max_length - 1;
          while (s.bl_count[bits] === 0) {
            bits--;
          }
          s.bl_count[bits]--;
          s.bl_count[bits + 1] += 2;
          s.bl_count[max_length]--;
          overflow -= 2;
        } while (overflow > 0);
        for (bits = max_length; bits !== 0; bits--) {
          n = s.bl_count[bits];
          while (n !== 0) {
            m = s.heap[--h];
            if (m > max_code) {
              continue;
            }
            if (tree[m * 2 + 1] !== bits) {
              s.opt_len += (bits - tree[m * 2 + 1]) * tree[m * 2];
              tree[m * 2 + 1] = bits;
            }
            n--;
          }
        }
      };
      var gen_codes = (tree, max_code, bl_count) => {
        const next_code = new Array(MAX_BITS + 1);
        let code = 0;
        let bits;
        let n;
        for (bits = 1; bits <= MAX_BITS; bits++) {
          code = code + bl_count[bits - 1] << 1;
          next_code[bits] = code;
        }
        for (n = 0; n <= max_code; n++) {
          let len = tree[n * 2 + 1];
          if (len === 0) {
            continue;
          }
          tree[n * 2] = bi_reverse(next_code[len]++, len);
        }
      };
      var tr_static_init = () => {
        let n;
        let bits;
        let length;
        let code;
        let dist;
        const bl_count = new Array(MAX_BITS + 1);
        length = 0;
        for (code = 0; code < LENGTH_CODES - 1; code++) {
          base_length[code] = length;
          for (n = 0; n < 1 << extra_lbits[code]; n++) {
            _length_code[length++] = code;
          }
        }
        _length_code[length - 1] = code;
        dist = 0;
        for (code = 0; code < 16; code++) {
          base_dist[code] = dist;
          for (n = 0; n < 1 << extra_dbits[code]; n++) {
            _dist_code[dist++] = code;
          }
        }
        dist >>= 7;
        for (; code < D_CODES; code++) {
          base_dist[code] = dist << 7;
          for (n = 0; n < 1 << extra_dbits[code] - 7; n++) {
            _dist_code[256 + dist++] = code;
          }
        }
        for (bits = 0; bits <= MAX_BITS; bits++) {
          bl_count[bits] = 0;
        }
        n = 0;
        while (n <= 143) {
          static_ltree[n * 2 + 1] = 8;
          n++;
          bl_count[8]++;
        }
        while (n <= 255) {
          static_ltree[n * 2 + 1] = 9;
          n++;
          bl_count[9]++;
        }
        while (n <= 279) {
          static_ltree[n * 2 + 1] = 7;
          n++;
          bl_count[7]++;
        }
        while (n <= 287) {
          static_ltree[n * 2 + 1] = 8;
          n++;
          bl_count[8]++;
        }
        gen_codes(static_ltree, L_CODES + 1, bl_count);
        for (n = 0; n < D_CODES; n++) {
          static_dtree[n * 2 + 1] = 5;
          static_dtree[n * 2] = bi_reverse(n, 5);
        }
        static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
        static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
        static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);
      };
      var init_block = (s) => {
        let n;
        for (n = 0; n < L_CODES; n++) {
          s.dyn_ltree[n * 2] = 0;
        }
        for (n = 0; n < D_CODES; n++) {
          s.dyn_dtree[n * 2] = 0;
        }
        for (n = 0; n < BL_CODES; n++) {
          s.bl_tree[n * 2] = 0;
        }
        s.dyn_ltree[END_BLOCK * 2] = 1;
        s.opt_len = s.static_len = 0;
        s.sym_next = s.matches = 0;
      };
      var bi_windup = (s) => {
        if (s.bi_valid > 8) {
          put_short(s, s.bi_buf);
        } else if (s.bi_valid > 0) {
          s.pending_buf[s.pending++] = s.bi_buf;
        }
        s.bi_buf = 0;
        s.bi_valid = 0;
      };
      var smaller = (tree, n, m, depth) => {
        const _n2 = n * 2;
        const _m2 = m * 2;
        return tree[_n2] < tree[_m2] || tree[_n2] === tree[_m2] && depth[n] <= depth[m];
      };
      var pqdownheap = (s, tree, k) => {
        const v = s.heap[k];
        let j = k << 1;
        while (j <= s.heap_len) {
          if (j < s.heap_len && smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
            j++;
          }
          if (smaller(tree, v, s.heap[j], s.depth)) {
            break;
          }
          s.heap[k] = s.heap[j];
          k = j;
          j <<= 1;
        }
        s.heap[k] = v;
      };
      var compress_block = (s, ltree, dtree) => {
        let dist;
        let lc;
        let sx = 0;
        let code;
        let extra;
        if (s.sym_next !== 0) {
          do {
            dist = s.pending_buf[s.sym_buf + sx++] & 255;
            dist += (s.pending_buf[s.sym_buf + sx++] & 255) << 8;
            lc = s.pending_buf[s.sym_buf + sx++];
            if (dist === 0) {
              send_code(s, lc, ltree);
            } else {
              code = _length_code[lc];
              send_code(s, code + LITERALS + 1, ltree);
              extra = extra_lbits[code];
              if (extra !== 0) {
                lc -= base_length[code];
                send_bits(s, lc, extra);
              }
              dist--;
              code = d_code(dist);
              send_code(s, code, dtree);
              extra = extra_dbits[code];
              if (extra !== 0) {
                dist -= base_dist[code];
                send_bits(s, dist, extra);
              }
            }
          } while (sx < s.sym_next);
        }
        send_code(s, END_BLOCK, ltree);
      };
      var build_tree = (s, desc) => {
        const tree = desc.dyn_tree;
        const stree = desc.stat_desc.static_tree;
        const has_stree = desc.stat_desc.has_stree;
        const elems = desc.stat_desc.elems;
        let n, m;
        let max_code = -1;
        let node;
        s.heap_len = 0;
        s.heap_max = HEAP_SIZE;
        for (n = 0; n < elems; n++) {
          if (tree[n * 2] !== 0) {
            s.heap[++s.heap_len] = max_code = n;
            s.depth[n] = 0;
          } else {
            tree[n * 2 + 1] = 0;
          }
        }
        while (s.heap_len < 2) {
          node = s.heap[++s.heap_len] = max_code < 2 ? ++max_code : 0;
          tree[node * 2] = 1;
          s.depth[node] = 0;
          s.opt_len--;
          if (has_stree) {
            s.static_len -= stree[node * 2 + 1];
          }
        }
        desc.max_code = max_code;
        for (n = s.heap_len >> 1; n >= 1; n--) {
          pqdownheap(s, tree, n);
        }
        node = elems;
        do {
          n = s.heap[
            1
            /*SMALLEST*/
          ];
          s.heap[
            1
            /*SMALLEST*/
          ] = s.heap[s.heap_len--];
          pqdownheap(
            s,
            tree,
            1
            /*SMALLEST*/
          );
          m = s.heap[
            1
            /*SMALLEST*/
          ];
          s.heap[--s.heap_max] = n;
          s.heap[--s.heap_max] = m;
          tree[node * 2] = tree[n * 2] + tree[m * 2];
          s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
          tree[n * 2 + 1] = tree[m * 2 + 1] = node;
          s.heap[
            1
            /*SMALLEST*/
          ] = node++;
          pqdownheap(
            s,
            tree,
            1
            /*SMALLEST*/
          );
        } while (s.heap_len >= 2);
        s.heap[--s.heap_max] = s.heap[
          1
          /*SMALLEST*/
        ];
        gen_bitlen(s, desc);
        gen_codes(tree, max_code, s.bl_count);
      };
      var scan_tree = (s, tree, max_code) => {
        let n;
        let prevlen = -1;
        let curlen;
        let nextlen = tree[0 * 2 + 1];
        let count = 0;
        let max_count = 7;
        let min_count = 4;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        }
        tree[(max_code + 1) * 2 + 1] = 65535;
        for (n = 0; n <= max_code; n++) {
          curlen = nextlen;
          nextlen = tree[(n + 1) * 2 + 1];
          if (++count < max_count && curlen === nextlen) {
            continue;
          } else if (count < min_count) {
            s.bl_tree[curlen * 2] += count;
          } else if (curlen !== 0) {
            if (curlen !== prevlen) {
              s.bl_tree[curlen * 2]++;
            }
            s.bl_tree[REP_3_6 * 2]++;
          } else if (count <= 10) {
            s.bl_tree[REPZ_3_10 * 2]++;
          } else {
            s.bl_tree[REPZ_11_138 * 2]++;
          }
          count = 0;
          prevlen = curlen;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          } else if (curlen === nextlen) {
            max_count = 6;
            min_count = 3;
          } else {
            max_count = 7;
            min_count = 4;
          }
        }
      };
      var send_tree = (s, tree, max_code) => {
        let n;
        let prevlen = -1;
        let curlen;
        let nextlen = tree[0 * 2 + 1];
        let count = 0;
        let max_count = 7;
        let min_count = 4;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;
        }
        for (n = 0; n <= max_code; n++) {
          curlen = nextlen;
          nextlen = tree[(n + 1) * 2 + 1];
          if (++count < max_count && curlen === nextlen) {
            continue;
          } else if (count < min_count) {
            do {
              send_code(s, curlen, s.bl_tree);
            } while (--count !== 0);
          } else if (curlen !== 0) {
            if (curlen !== prevlen) {
              send_code(s, curlen, s.bl_tree);
              count--;
            }
            send_code(s, REP_3_6, s.bl_tree);
            send_bits(s, count - 3, 2);
          } else if (count <= 10) {
            send_code(s, REPZ_3_10, s.bl_tree);
            send_bits(s, count - 3, 3);
          } else {
            send_code(s, REPZ_11_138, s.bl_tree);
            send_bits(s, count - 11, 7);
          }
          count = 0;
          prevlen = curlen;
          if (nextlen === 0) {
            max_count = 138;
            min_count = 3;
          } else if (curlen === nextlen) {
            max_count = 6;
            min_count = 3;
          } else {
            max_count = 7;
            min_count = 4;
          }
        }
      };
      var build_bl_tree = (s) => {
        let max_blindex;
        scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
        scan_tree(s, s.dyn_dtree, s.d_desc.max_code);
        build_tree(s, s.bl_desc);
        for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
          if (s.bl_tree[bl_order[max_blindex] * 2 + 1] !== 0) {
            break;
          }
        }
        s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
        return max_blindex;
      };
      var send_all_trees = (s, lcodes, dcodes, blcodes) => {
        let rank;
        send_bits(s, lcodes - 257, 5);
        send_bits(s, dcodes - 1, 5);
        send_bits(s, blcodes - 4, 4);
        for (rank = 0; rank < blcodes; rank++) {
          send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1], 3);
        }
        send_tree(s, s.dyn_ltree, lcodes - 1);
        send_tree(s, s.dyn_dtree, dcodes - 1);
      };
      var detect_data_type = (s) => {
        let block_mask = 4093624447;
        let n;
        for (n = 0; n <= 31; n++, block_mask >>>= 1) {
          if (block_mask & 1 && s.dyn_ltree[n * 2] !== 0) {
            return Z_BINARY;
          }
        }
        if (s.dyn_ltree[9 * 2] !== 0 || s.dyn_ltree[10 * 2] !== 0 || s.dyn_ltree[13 * 2] !== 0) {
          return Z_TEXT;
        }
        for (n = 32; n < LITERALS; n++) {
          if (s.dyn_ltree[n * 2] !== 0) {
            return Z_TEXT;
          }
        }
        return Z_BINARY;
      };
      var static_init_done = false;
      var _tr_init = (s) => {
        if (!static_init_done) {
          tr_static_init();
          static_init_done = true;
        }
        s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
        s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
        s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);
        s.bi_buf = 0;
        s.bi_valid = 0;
        init_block(s);
      };
      var _tr_stored_block = (s, buf, stored_len, last) => {
        send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
        bi_windup(s);
        put_short(s, stored_len);
        put_short(s, ~stored_len);
        if (stored_len) {
          s.pending_buf.set(s.window.subarray(buf, buf + stored_len), s.pending);
        }
        s.pending += stored_len;
      };
      var _tr_align = (s) => {
        send_bits(s, STATIC_TREES << 1, 3);
        send_code(s, END_BLOCK, static_ltree);
        bi_flush(s);
      };
      var _tr_flush_block = (s, buf, stored_len, last) => {
        let opt_lenb, static_lenb;
        let max_blindex = 0;
        if (s.level > 0) {
          if (s.strm.data_type === Z_UNKNOWN) {
            s.strm.data_type = detect_data_type(s);
          }
          build_tree(s, s.l_desc);
          build_tree(s, s.d_desc);
          max_blindex = build_bl_tree(s);
          opt_lenb = s.opt_len + 3 + 7 >>> 3;
          static_lenb = s.static_len + 3 + 7 >>> 3;
          if (static_lenb <= opt_lenb) {
            opt_lenb = static_lenb;
          }
        } else {
          opt_lenb = static_lenb = stored_len + 5;
        }
        if (stored_len + 4 <= opt_lenb && buf !== -1) {
          _tr_stored_block(s, buf, stored_len, last);
        } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {
          send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
          compress_block(s, static_ltree, static_dtree);
        } else {
          send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
          send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
          compress_block(s, s.dyn_ltree, s.dyn_dtree);
        }
        init_block(s);
        if (last) {
          bi_windup(s);
        }
      };
      var _tr_tally = (s, dist, lc) => {
        s.pending_buf[s.sym_buf + s.sym_next++] = dist;
        s.pending_buf[s.sym_buf + s.sym_next++] = dist >> 8;
        s.pending_buf[s.sym_buf + s.sym_next++] = lc;
        if (dist === 0) {
          s.dyn_ltree[lc * 2]++;
        } else {
          s.matches++;
          dist--;
          s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]++;
          s.dyn_dtree[d_code(dist) * 2]++;
        }
        return s.sym_next === s.sym_end;
      };
      module.exports._tr_init = _tr_init;
      module.exports._tr_stored_block = _tr_stored_block;
      module.exports._tr_flush_block = _tr_flush_block;
      module.exports._tr_tally = _tr_tally;
      module.exports._tr_align = _tr_align;
    }
  });

  // tools/node_modules/pako/lib/zlib/adler32.js
  var require_adler32 = __commonJS({
    "tools/node_modules/pako/lib/zlib/adler32.js"(exports, module) {
      "use strict";
      var adler32 = (adler, buf, len, pos) => {
        let s1 = adler & 65535 | 0, s2 = adler >>> 16 & 65535 | 0, n = 0;
        while (len !== 0) {
          n = len > 2e3 ? 2e3 : len;
          len -= n;
          do {
            s1 = s1 + buf[pos++] | 0;
            s2 = s2 + s1 | 0;
          } while (--n);
          s1 %= 65521;
          s2 %= 65521;
        }
        return s1 | s2 << 16 | 0;
      };
      module.exports = adler32;
    }
  });

  // tools/node_modules/pako/lib/zlib/crc32.js
  var require_crc32 = __commonJS({
    "tools/node_modules/pako/lib/zlib/crc32.js"(exports, module) {
      "use strict";
      var makeTable = () => {
        let c, table = [];
        for (var n = 0; n < 256; n++) {
          c = n;
          for (var k = 0; k < 8; k++) {
            c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
          }
          table[n] = c;
        }
        return table;
      };
      var crcTable = new Uint32Array(makeTable());
      var crc32 = (crc, buf, len, pos) => {
        const t = crcTable;
        const end = pos + len;
        crc ^= -1;
        for (let i = pos; i < end; i++) {
          crc = crc >>> 8 ^ t[(crc ^ buf[i]) & 255];
        }
        return crc ^ -1;
      };
      module.exports = crc32;
    }
  });

  // tools/node_modules/pako/lib/zlib/messages.js
  var require_messages = __commonJS({
    "tools/node_modules/pako/lib/zlib/messages.js"(exports, module) {
      "use strict";
      module.exports = {
        2: "need dictionary",
        /* Z_NEED_DICT       2  */
        1: "stream end",
        /* Z_STREAM_END      1  */
        0: "",
        /* Z_OK              0  */
        "-1": "file error",
        /* Z_ERRNO         (-1) */
        "-2": "stream error",
        /* Z_STREAM_ERROR  (-2) */
        "-3": "data error",
        /* Z_DATA_ERROR    (-3) */
        "-4": "insufficient memory",
        /* Z_MEM_ERROR     (-4) */
        "-5": "buffer error",
        /* Z_BUF_ERROR     (-5) */
        "-6": "incompatible version"
        /* Z_VERSION_ERROR (-6) */
      };
    }
  });

  // tools/node_modules/pako/lib/zlib/constants.js
  var require_constants = __commonJS({
    "tools/node_modules/pako/lib/zlib/constants.js"(exports, module) {
      "use strict";
      module.exports = {
        /* Allowed flush values; see deflate() and inflate() below for details */
        Z_NO_FLUSH: 0,
        Z_PARTIAL_FLUSH: 1,
        Z_SYNC_FLUSH: 2,
        Z_FULL_FLUSH: 3,
        Z_FINISH: 4,
        Z_BLOCK: 5,
        Z_TREES: 6,
        /* Return codes for the compression/decompression functions. Negative values
        * are errors, positive values are used for special but normal events.
        */
        Z_OK: 0,
        Z_STREAM_END: 1,
        Z_NEED_DICT: 2,
        Z_ERRNO: -1,
        Z_STREAM_ERROR: -2,
        Z_DATA_ERROR: -3,
        Z_MEM_ERROR: -4,
        Z_BUF_ERROR: -5,
        //Z_VERSION_ERROR: -6,
        /* compression levels */
        Z_NO_COMPRESSION: 0,
        Z_BEST_SPEED: 1,
        Z_BEST_COMPRESSION: 9,
        Z_DEFAULT_COMPRESSION: -1,
        Z_FILTERED: 1,
        Z_HUFFMAN_ONLY: 2,
        Z_RLE: 3,
        Z_FIXED: 4,
        Z_DEFAULT_STRATEGY: 0,
        /* Possible values of the data_type field (though see inflate()) */
        Z_BINARY: 0,
        Z_TEXT: 1,
        //Z_ASCII:                1, // = Z_TEXT (deprecated)
        Z_UNKNOWN: 2,
        /* The deflate compression method */
        Z_DEFLATED: 8
        //Z_NULL:                 null // Use -1 or null inline, depending on var type
      };
    }
  });

  // tools/node_modules/pako/lib/zlib/deflate.js
  var require_deflate = __commonJS({
    "tools/node_modules/pako/lib/zlib/deflate.js"(exports, module) {
      "use strict";
      var { _tr_init, _tr_stored_block, _tr_flush_block, _tr_tally, _tr_align } = require_trees();
      var adler32 = require_adler32();
      var crc32 = require_crc32();
      var msg = require_messages();
      var {
        Z_NO_FLUSH,
        Z_PARTIAL_FLUSH,
        Z_FULL_FLUSH,
        Z_FINISH,
        Z_BLOCK,
        Z_OK,
        Z_STREAM_END,
        Z_STREAM_ERROR,
        Z_DATA_ERROR,
        Z_BUF_ERROR,
        Z_DEFAULT_COMPRESSION,
        Z_FILTERED,
        Z_HUFFMAN_ONLY,
        Z_RLE,
        Z_FIXED,
        Z_DEFAULT_STRATEGY,
        Z_UNKNOWN,
        Z_DEFLATED
      } = require_constants();
      var MAX_MEM_LEVEL = 9;
      var MAX_WBITS = 15;
      var DEF_MEM_LEVEL = 8;
      var LENGTH_CODES = 29;
      var LITERALS = 256;
      var L_CODES = LITERALS + 1 + LENGTH_CODES;
      var D_CODES = 30;
      var BL_CODES = 19;
      var HEAP_SIZE = 2 * L_CODES + 1;
      var MAX_BITS = 15;
      var MIN_MATCH = 3;
      var MAX_MATCH = 258;
      var MIN_LOOKAHEAD = MAX_MATCH + MIN_MATCH + 1;
      var PRESET_DICT = 32;
      var INIT_STATE = 42;
      var GZIP_STATE = 57;
      var EXTRA_STATE = 69;
      var NAME_STATE = 73;
      var COMMENT_STATE = 91;
      var HCRC_STATE = 103;
      var BUSY_STATE = 113;
      var FINISH_STATE = 666;
      var BS_NEED_MORE = 1;
      var BS_BLOCK_DONE = 2;
      var BS_FINISH_STARTED = 3;
      var BS_FINISH_DONE = 4;
      var OS_CODE = 3;
      var err = (strm, errorCode) => {
        strm.msg = msg[errorCode];
        return errorCode;
      };
      var rank = (f) => {
        return f * 2 - (f > 4 ? 9 : 0);
      };
      var zero = (buf) => {
        let len = buf.length;
        while (--len >= 0) {
          buf[len] = 0;
        }
      };
      var slide_hash = (s) => {
        let n, m;
        let p;
        let wsize = s.w_size;
        n = s.hash_size;
        p = n;
        do {
          m = s.head[--p];
          s.head[p] = m >= wsize ? m - wsize : 0;
        } while (--n);
        n = wsize;
        p = n;
        do {
          m = s.prev[--p];
          s.prev[p] = m >= wsize ? m - wsize : 0;
        } while (--n);
      };
      var HASH_ZLIB = (s, prev, data) => (prev << s.hash_shift ^ data) & s.hash_mask;
      var HASH = HASH_ZLIB;
      var flush_pending = (strm) => {
        const s = strm.state;
        let len = s.pending;
        if (len > strm.avail_out) {
          len = strm.avail_out;
        }
        if (len === 0) {
          return;
        }
        strm.output.set(s.pending_buf.subarray(s.pending_out, s.pending_out + len), strm.next_out);
        strm.next_out += len;
        s.pending_out += len;
        strm.total_out += len;
        strm.avail_out -= len;
        s.pending -= len;
        if (s.pending === 0) {
          s.pending_out = 0;
        }
      };
      var flush_block_only = (s, last) => {
        _tr_flush_block(s, s.block_start >= 0 ? s.block_start : -1, s.strstart - s.block_start, last);
        s.block_start = s.strstart;
        flush_pending(s.strm);
      };
      var put_byte = (s, b) => {
        s.pending_buf[s.pending++] = b;
      };
      var putShortMSB = (s, b) => {
        s.pending_buf[s.pending++] = b >>> 8 & 255;
        s.pending_buf[s.pending++] = b & 255;
      };
      var read_buf = (strm, buf, start, size) => {
        let len = strm.avail_in;
        if (len > size) {
          len = size;
        }
        if (len === 0) {
          return 0;
        }
        strm.avail_in -= len;
        buf.set(strm.input.subarray(strm.next_in, strm.next_in + len), start);
        if (strm.state.wrap === 1) {
          strm.adler = adler32(strm.adler, buf, len, start);
        } else if (strm.state.wrap === 2) {
          strm.adler = crc32(strm.adler, buf, len, start);
        }
        strm.next_in += len;
        strm.total_in += len;
        return len;
      };
      var longest_match = (s, cur_match) => {
        let chain_length = s.max_chain_length;
        let scan = s.strstart;
        let match;
        let len;
        let best_len = s.prev_length;
        let nice_match = s.nice_match;
        const limit = s.strstart > s.w_size - MIN_LOOKAHEAD ? s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0;
        const _win = s.window;
        const wmask = s.w_mask;
        const prev = s.prev;
        const strend = s.strstart + MAX_MATCH;
        let scan_end1 = _win[scan + best_len - 1];
        let scan_end = _win[scan + best_len];
        if (s.prev_length >= s.good_match) {
          chain_length >>= 2;
        }
        if (nice_match > s.lookahead) {
          nice_match = s.lookahead;
        }
        do {
          match = cur_match;
          if (_win[match + best_len] !== scan_end || _win[match + best_len - 1] !== scan_end1 || _win[match] !== _win[scan] || _win[++match] !== _win[scan + 1]) {
            continue;
          }
          scan += 2;
          match++;
          do {
          } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && _win[++scan] === _win[++match] && scan < strend);
          len = MAX_MATCH - (strend - scan);
          scan = strend - MAX_MATCH;
          if (len > best_len) {
            s.match_start = cur_match;
            best_len = len;
            if (len >= nice_match) {
              break;
            }
            scan_end1 = _win[scan + best_len - 1];
            scan_end = _win[scan + best_len];
          }
        } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);
        if (best_len <= s.lookahead) {
          return best_len;
        }
        return s.lookahead;
      };
      var fill_window = (s) => {
        const _w_size = s.w_size;
        let n, more, str;
        do {
          more = s.window_size - s.lookahead - s.strstart;
          if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {
            s.window.set(s.window.subarray(_w_size, _w_size + _w_size - more), 0);
            s.match_start -= _w_size;
            s.strstart -= _w_size;
            s.block_start -= _w_size;
            if (s.insert > s.strstart) {
              s.insert = s.strstart;
            }
            slide_hash(s);
            more += _w_size;
          }
          if (s.strm.avail_in === 0) {
            break;
          }
          n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
          s.lookahead += n;
          if (s.lookahead + s.insert >= MIN_MATCH) {
            str = s.strstart - s.insert;
            s.ins_h = s.window[str];
            s.ins_h = HASH(s, s.ins_h, s.window[str + 1]);
            while (s.insert) {
              s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
              s.prev[str & s.w_mask] = s.head[s.ins_h];
              s.head[s.ins_h] = str;
              str++;
              s.insert--;
              if (s.lookahead + s.insert < MIN_MATCH) {
                break;
              }
            }
          }
        } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);
      };
      var deflate_stored = (s, flush) => {
        let min_block = s.pending_buf_size - 5 > s.w_size ? s.w_size : s.pending_buf_size - 5;
        let len, left, have, last = 0;
        let used = s.strm.avail_in;
        do {
          len = 65535;
          have = s.bi_valid + 42 >> 3;
          if (s.strm.avail_out < have) {
            break;
          }
          have = s.strm.avail_out - have;
          left = s.strstart - s.block_start;
          if (len > left + s.strm.avail_in) {
            len = left + s.strm.avail_in;
          }
          if (len > have) {
            len = have;
          }
          if (len < min_block && (len === 0 && flush !== Z_FINISH || flush === Z_NO_FLUSH || len !== left + s.strm.avail_in)) {
            break;
          }
          last = flush === Z_FINISH && len === left + s.strm.avail_in ? 1 : 0;
          _tr_stored_block(s, 0, 0, last);
          s.pending_buf[s.pending - 4] = len;
          s.pending_buf[s.pending - 3] = len >> 8;
          s.pending_buf[s.pending - 2] = ~len;
          s.pending_buf[s.pending - 1] = ~len >> 8;
          flush_pending(s.strm);
          if (left) {
            if (left > len) {
              left = len;
            }
            s.strm.output.set(s.window.subarray(s.block_start, s.block_start + left), s.strm.next_out);
            s.strm.next_out += left;
            s.strm.avail_out -= left;
            s.strm.total_out += left;
            s.block_start += left;
            len -= left;
          }
          if (len) {
            read_buf(s.strm, s.strm.output, s.strm.next_out, len);
            s.strm.next_out += len;
            s.strm.avail_out -= len;
            s.strm.total_out += len;
          }
        } while (last === 0);
        used -= s.strm.avail_in;
        if (used) {
          if (used >= s.w_size) {
            s.matches = 2;
            s.window.set(s.strm.input.subarray(s.strm.next_in - s.w_size, s.strm.next_in), 0);
            s.strstart = s.w_size;
            s.insert = s.strstart;
          } else {
            if (s.window_size - s.strstart <= used) {
              s.strstart -= s.w_size;
              s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
              if (s.matches < 2) {
                s.matches++;
              }
              if (s.insert > s.strstart) {
                s.insert = s.strstart;
              }
            }
            s.window.set(s.strm.input.subarray(s.strm.next_in - used, s.strm.next_in), s.strstart);
            s.strstart += used;
            s.insert += used > s.w_size - s.insert ? s.w_size - s.insert : used;
          }
          s.block_start = s.strstart;
        }
        if (s.high_water < s.strstart) {
          s.high_water = s.strstart;
        }
        if (last) {
          return BS_FINISH_DONE;
        }
        if (flush !== Z_NO_FLUSH && flush !== Z_FINISH && s.strm.avail_in === 0 && s.strstart === s.block_start) {
          return BS_BLOCK_DONE;
        }
        have = s.window_size - s.strstart;
        if (s.strm.avail_in > have && s.block_start >= s.w_size) {
          s.block_start -= s.w_size;
          s.strstart -= s.w_size;
          s.window.set(s.window.subarray(s.w_size, s.w_size + s.strstart), 0);
          if (s.matches < 2) {
            s.matches++;
          }
          have += s.w_size;
          if (s.insert > s.strstart) {
            s.insert = s.strstart;
          }
        }
        if (have > s.strm.avail_in) {
          have = s.strm.avail_in;
        }
        if (have) {
          read_buf(s.strm, s.window, s.strstart, have);
          s.strstart += have;
          s.insert += have > s.w_size - s.insert ? s.w_size - s.insert : have;
        }
        if (s.high_water < s.strstart) {
          s.high_water = s.strstart;
        }
        have = s.bi_valid + 42 >> 3;
        have = s.pending_buf_size - have > 65535 ? 65535 : s.pending_buf_size - have;
        min_block = have > s.w_size ? s.w_size : have;
        left = s.strstart - s.block_start;
        if (left >= min_block || (left || flush === Z_FINISH) && flush !== Z_NO_FLUSH && s.strm.avail_in === 0 && left <= have) {
          len = left > have ? have : left;
          last = flush === Z_FINISH && s.strm.avail_in === 0 && len === left ? 1 : 0;
          _tr_stored_block(s, s.block_start, len, last);
          s.block_start += len;
          flush_pending(s.strm);
        }
        return last ? BS_FINISH_STARTED : BS_NEED_MORE;
      };
      var deflate_fast = (s, flush) => {
        let hash_head;
        let bflush;
        for (; ; ) {
          if (s.lookahead < MIN_LOOKAHEAD) {
            fill_window(s);
            if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            if (s.lookahead === 0) {
              break;
            }
          }
          hash_head = 0;
          if (s.lookahead >= MIN_MATCH) {
            s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
          }
          if (hash_head !== 0 && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
            s.match_length = longest_match(s, hash_head);
          }
          if (s.match_length >= MIN_MATCH) {
            bflush = _tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);
            s.lookahead -= s.match_length;
            if (s.match_length <= s.max_lazy_match && s.lookahead >= MIN_MATCH) {
              s.match_length--;
              do {
                s.strstart++;
                s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
                hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                s.head[s.ins_h] = s.strstart;
              } while (--s.match_length !== 0);
              s.strstart++;
            } else {
              s.strstart += s.match_length;
              s.match_length = 0;
              s.ins_h = s.window[s.strstart];
              s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + 1]);
            }
          } else {
            bflush = _tr_tally(s, 0, s.window[s.strstart]);
            s.lookahead--;
            s.strstart++;
          }
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        }
        s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.sym_next) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      };
      var deflate_slow = (s, flush) => {
        let hash_head;
        let bflush;
        let max_insert;
        for (; ; ) {
          if (s.lookahead < MIN_LOOKAHEAD) {
            fill_window(s);
            if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            if (s.lookahead === 0) {
              break;
            }
          }
          hash_head = 0;
          if (s.lookahead >= MIN_MATCH) {
            s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
            hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = s.strstart;
          }
          s.prev_length = s.match_length;
          s.prev_match = s.match_start;
          s.match_length = MIN_MATCH - 1;
          if (hash_head !== 0 && s.prev_length < s.max_lazy_match && s.strstart - hash_head <= s.w_size - MIN_LOOKAHEAD) {
            s.match_length = longest_match(s, hash_head);
            if (s.match_length <= 5 && (s.strategy === Z_FILTERED || s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096)) {
              s.match_length = MIN_MATCH - 1;
            }
          }
          if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
            max_insert = s.strstart + s.lookahead - MIN_MATCH;
            bflush = _tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
            s.lookahead -= s.prev_length - 1;
            s.prev_length -= 2;
            do {
              if (++s.strstart <= max_insert) {
                s.ins_h = HASH(s, s.ins_h, s.window[s.strstart + MIN_MATCH - 1]);
                hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
                s.head[s.ins_h] = s.strstart;
              }
            } while (--s.prev_length !== 0);
            s.match_available = 0;
            s.match_length = MIN_MATCH - 1;
            s.strstart++;
            if (bflush) {
              flush_block_only(s, false);
              if (s.strm.avail_out === 0) {
                return BS_NEED_MORE;
              }
            }
          } else if (s.match_available) {
            bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
            if (bflush) {
              flush_block_only(s, false);
            }
            s.strstart++;
            s.lookahead--;
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          } else {
            s.match_available = 1;
            s.strstart++;
            s.lookahead--;
          }
        }
        if (s.match_available) {
          bflush = _tr_tally(s, 0, s.window[s.strstart - 1]);
          s.match_available = 0;
        }
        s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.sym_next) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      };
      var deflate_rle = (s, flush) => {
        let bflush;
        let prev;
        let scan, strend;
        const _win = s.window;
        for (; ; ) {
          if (s.lookahead <= MAX_MATCH) {
            fill_window(s);
            if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
              return BS_NEED_MORE;
            }
            if (s.lookahead === 0) {
              break;
            }
          }
          s.match_length = 0;
          if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
            scan = s.strstart - 1;
            prev = _win[scan];
            if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
              strend = s.strstart + MAX_MATCH;
              do {
              } while (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan] && scan < strend);
              s.match_length = MAX_MATCH - (strend - scan);
              if (s.match_length > s.lookahead) {
                s.match_length = s.lookahead;
              }
            }
          }
          if (s.match_length >= MIN_MATCH) {
            bflush = _tr_tally(s, 1, s.match_length - MIN_MATCH);
            s.lookahead -= s.match_length;
            s.strstart += s.match_length;
            s.match_length = 0;
          } else {
            bflush = _tr_tally(s, 0, s.window[s.strstart]);
            s.lookahead--;
            s.strstart++;
          }
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        }
        s.insert = 0;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.sym_next) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      };
      var deflate_huff = (s, flush) => {
        let bflush;
        for (; ; ) {
          if (s.lookahead === 0) {
            fill_window(s);
            if (s.lookahead === 0) {
              if (flush === Z_NO_FLUSH) {
                return BS_NEED_MORE;
              }
              break;
            }
          }
          s.match_length = 0;
          bflush = _tr_tally(s, 0, s.window[s.strstart]);
          s.lookahead--;
          s.strstart++;
          if (bflush) {
            flush_block_only(s, false);
            if (s.strm.avail_out === 0) {
              return BS_NEED_MORE;
            }
          }
        }
        s.insert = 0;
        if (flush === Z_FINISH) {
          flush_block_only(s, true);
          if (s.strm.avail_out === 0) {
            return BS_FINISH_STARTED;
          }
          return BS_FINISH_DONE;
        }
        if (s.sym_next) {
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        }
        return BS_BLOCK_DONE;
      };
      function Config(good_length, max_lazy, nice_length, max_chain, func) {
        this.good_length = good_length;
        this.max_lazy = max_lazy;
        this.nice_length = nice_length;
        this.max_chain = max_chain;
        this.func = func;
      }
      var configuration_table = [
        /*      good lazy nice chain */
        new Config(0, 0, 0, 0, deflate_stored),
        /* 0 store only */
        new Config(4, 4, 8, 4, deflate_fast),
        /* 1 max speed, no lazy matches */
        new Config(4, 5, 16, 8, deflate_fast),
        /* 2 */
        new Config(4, 6, 32, 32, deflate_fast),
        /* 3 */
        new Config(4, 4, 16, 16, deflate_slow),
        /* 4 lazy matches */
        new Config(8, 16, 32, 32, deflate_slow),
        /* 5 */
        new Config(8, 16, 128, 128, deflate_slow),
        /* 6 */
        new Config(8, 32, 128, 256, deflate_slow),
        /* 7 */
        new Config(32, 128, 258, 1024, deflate_slow),
        /* 8 */
        new Config(32, 258, 258, 4096, deflate_slow)
        /* 9 max compression */
      ];
      var lm_init = (s) => {
        s.window_size = 2 * s.w_size;
        zero(s.head);
        s.max_lazy_match = configuration_table[s.level].max_lazy;
        s.good_match = configuration_table[s.level].good_length;
        s.nice_match = configuration_table[s.level].nice_length;
        s.max_chain_length = configuration_table[s.level].max_chain;
        s.strstart = 0;
        s.block_start = 0;
        s.lookahead = 0;
        s.insert = 0;
        s.match_length = s.prev_length = MIN_MATCH - 1;
        s.match_available = 0;
        s.ins_h = 0;
      };
      function DeflateState() {
        this.strm = null;
        this.status = 0;
        this.pending_buf = null;
        this.pending_buf_size = 0;
        this.pending_out = 0;
        this.pending = 0;
        this.wrap = 0;
        this.gzhead = null;
        this.gzindex = 0;
        this.method = Z_DEFLATED;
        this.last_flush = -1;
        this.w_size = 0;
        this.w_bits = 0;
        this.w_mask = 0;
        this.window = null;
        this.window_size = 0;
        this.prev = null;
        this.head = null;
        this.ins_h = 0;
        this.hash_size = 0;
        this.hash_bits = 0;
        this.hash_mask = 0;
        this.hash_shift = 0;
        this.block_start = 0;
        this.match_length = 0;
        this.prev_match = 0;
        this.match_available = 0;
        this.strstart = 0;
        this.match_start = 0;
        this.lookahead = 0;
        this.prev_length = 0;
        this.max_chain_length = 0;
        this.max_lazy_match = 0;
        this.level = 0;
        this.strategy = 0;
        this.good_match = 0;
        this.nice_match = 0;
        this.dyn_ltree = new Uint16Array(HEAP_SIZE * 2);
        this.dyn_dtree = new Uint16Array((2 * D_CODES + 1) * 2);
        this.bl_tree = new Uint16Array((2 * BL_CODES + 1) * 2);
        zero(this.dyn_ltree);
        zero(this.dyn_dtree);
        zero(this.bl_tree);
        this.l_desc = null;
        this.d_desc = null;
        this.bl_desc = null;
        this.bl_count = new Uint16Array(MAX_BITS + 1);
        this.heap = new Uint16Array(2 * L_CODES + 1);
        zero(this.heap);
        this.heap_len = 0;
        this.heap_max = 0;
        this.depth = new Uint16Array(2 * L_CODES + 1);
        zero(this.depth);
        this.sym_buf = 0;
        this.lit_bufsize = 0;
        this.sym_next = 0;
        this.sym_end = 0;
        this.opt_len = 0;
        this.static_len = 0;
        this.matches = 0;
        this.insert = 0;
        this.bi_buf = 0;
        this.bi_valid = 0;
      }
      var deflateStateCheck = (strm) => {
        if (!strm) {
          return 1;
        }
        const s = strm.state;
        if (!s || s.strm !== strm || s.status !== INIT_STATE && //#ifdef GZIP
        s.status !== GZIP_STATE && //#endif
        s.status !== EXTRA_STATE && s.status !== NAME_STATE && s.status !== COMMENT_STATE && s.status !== HCRC_STATE && s.status !== BUSY_STATE && s.status !== FINISH_STATE) {
          return 1;
        }
        return 0;
      };
      var deflateResetKeep = (strm) => {
        if (deflateStateCheck(strm)) {
          return err(strm, Z_STREAM_ERROR);
        }
        strm.total_in = strm.total_out = 0;
        strm.data_type = Z_UNKNOWN;
        const s = strm.state;
        s.pending = 0;
        s.pending_out = 0;
        if (s.wrap < 0) {
          s.wrap = -s.wrap;
        }
        s.status = //#ifdef GZIP
        s.wrap === 2 ? GZIP_STATE : (
          //#endif
          s.wrap ? INIT_STATE : BUSY_STATE
        );
        strm.adler = s.wrap === 2 ? 0 : 1;
        s.last_flush = -2;
        _tr_init(s);
        return Z_OK;
      };
      var deflateReset = (strm) => {
        const ret = deflateResetKeep(strm);
        if (ret === Z_OK) {
          lm_init(strm.state);
        }
        return ret;
      };
      var deflateSetHeader = (strm, head) => {
        if (deflateStateCheck(strm) || strm.state.wrap !== 2) {
          return Z_STREAM_ERROR;
        }
        strm.state.gzhead = head;
        return Z_OK;
      };
      var deflateInit2 = (strm, level, method, windowBits, memLevel, strategy) => {
        if (!strm) {
          return Z_STREAM_ERROR;
        }
        let wrap = 1;
        if (level === Z_DEFAULT_COMPRESSION) {
          level = 6;
        }
        if (windowBits < 0) {
          wrap = 0;
          windowBits = -windowBits;
        } else if (windowBits > 15) {
          wrap = 2;
          windowBits -= 16;
        }
        if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED || windowBits < 8 || windowBits > 15 || level < 0 || level > 9 || strategy < 0 || strategy > Z_FIXED || windowBits === 8 && wrap !== 1) {
          return err(strm, Z_STREAM_ERROR);
        }
        if (windowBits === 8) {
          windowBits = 9;
        }
        const s = new DeflateState();
        strm.state = s;
        s.strm = strm;
        s.status = INIT_STATE;
        s.wrap = wrap;
        s.gzhead = null;
        s.w_bits = windowBits;
        s.w_size = 1 << s.w_bits;
        s.w_mask = s.w_size - 1;
        s.hash_bits = memLevel + 7;
        s.hash_size = 1 << s.hash_bits;
        s.hash_mask = s.hash_size - 1;
        s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);
        s.window = new Uint8Array(s.w_size * 2);
        s.head = new Uint16Array(s.hash_size);
        s.prev = new Uint16Array(s.w_size);
        s.lit_bufsize = 1 << memLevel + 6;
        s.pending_buf_size = s.lit_bufsize * 4;
        s.pending_buf = new Uint8Array(s.pending_buf_size);
        s.sym_buf = s.lit_bufsize;
        s.sym_end = (s.lit_bufsize - 1) * 3;
        s.level = level;
        s.strategy = strategy;
        s.method = method;
        return deflateReset(strm);
      };
      var deflateInit = (strm, level) => {
        return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
      };
      var deflate = (strm, flush) => {
        if (deflateStateCheck(strm) || flush > Z_BLOCK || flush < 0) {
          return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
        }
        const s = strm.state;
        if (!strm.output || strm.avail_in !== 0 && !strm.input || s.status === FINISH_STATE && flush !== Z_FINISH) {
          return err(strm, strm.avail_out === 0 ? Z_BUF_ERROR : Z_STREAM_ERROR);
        }
        const old_flush = s.last_flush;
        s.last_flush = flush;
        if (s.pending !== 0) {
          flush_pending(strm);
          if (strm.avail_out === 0) {
            s.last_flush = -1;
            return Z_OK;
          }
        } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) && flush !== Z_FINISH) {
          return err(strm, Z_BUF_ERROR);
        }
        if (s.status === FINISH_STATE && strm.avail_in !== 0) {
          return err(strm, Z_BUF_ERROR);
        }
        if (s.status === INIT_STATE && s.wrap === 0) {
          s.status = BUSY_STATE;
        }
        if (s.status === INIT_STATE) {
          let header = Z_DEFLATED + (s.w_bits - 8 << 4) << 8;
          let level_flags = -1;
          if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
            level_flags = 0;
          } else if (s.level < 6) {
            level_flags = 1;
          } else if (s.level === 6) {
            level_flags = 2;
          } else {
            level_flags = 3;
          }
          header |= level_flags << 6;
          if (s.strstart !== 0) {
            header |= PRESET_DICT;
          }
          header += 31 - header % 31;
          putShortMSB(s, header);
          if (s.strstart !== 0) {
            putShortMSB(s, strm.adler >>> 16);
            putShortMSB(s, strm.adler & 65535);
          }
          strm.adler = 1;
          s.status = BUSY_STATE;
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK;
          }
        }
        if (s.status === GZIP_STATE) {
          strm.adler = 0;
          put_byte(s, 31);
          put_byte(s, 139);
          put_byte(s, 8);
          if (!s.gzhead) {
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
            put_byte(s, OS_CODE);
            s.status = BUSY_STATE;
            flush_pending(strm);
            if (s.pending !== 0) {
              s.last_flush = -1;
              return Z_OK;
            }
          } else {
            put_byte(
              s,
              (s.gzhead.text ? 1 : 0) + (s.gzhead.hcrc ? 2 : 0) + (!s.gzhead.extra ? 0 : 4) + (!s.gzhead.name ? 0 : 8) + (!s.gzhead.comment ? 0 : 16)
            );
            put_byte(s, s.gzhead.time & 255);
            put_byte(s, s.gzhead.time >> 8 & 255);
            put_byte(s, s.gzhead.time >> 16 & 255);
            put_byte(s, s.gzhead.time >> 24 & 255);
            put_byte(s, s.level === 9 ? 2 : s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ? 4 : 0);
            put_byte(s, s.gzhead.os & 255);
            if (s.gzhead.extra && s.gzhead.extra.length) {
              put_byte(s, s.gzhead.extra.length & 255);
              put_byte(s, s.gzhead.extra.length >> 8 & 255);
            }
            if (s.gzhead.hcrc) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
            }
            s.gzindex = 0;
            s.status = EXTRA_STATE;
          }
        }
        if (s.status === EXTRA_STATE) {
          if (s.gzhead.extra) {
            let beg = s.pending;
            let left = (s.gzhead.extra.length & 65535) - s.gzindex;
            while (s.pending + left > s.pending_buf_size) {
              let copy = s.pending_buf_size - s.pending;
              s.pending_buf.set(s.gzhead.extra.subarray(s.gzindex, s.gzindex + copy), s.pending);
              s.pending = s.pending_buf_size;
              if (s.gzhead.hcrc && s.pending > beg) {
                strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
              }
              s.gzindex += copy;
              flush_pending(strm);
              if (s.pending !== 0) {
                s.last_flush = -1;
                return Z_OK;
              }
              beg = 0;
              left -= copy;
            }
            let gzhead_extra = new Uint8Array(s.gzhead.extra);
            s.pending_buf.set(gzhead_extra.subarray(s.gzindex, s.gzindex + left), s.pending);
            s.pending += left;
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            s.gzindex = 0;
          }
          s.status = NAME_STATE;
        }
        if (s.status === NAME_STATE) {
          if (s.gzhead.name) {
            let beg = s.pending;
            let val;
            do {
              if (s.pending === s.pending_buf_size) {
                if (s.gzhead.hcrc && s.pending > beg) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                }
                flush_pending(strm);
                if (s.pending !== 0) {
                  s.last_flush = -1;
                  return Z_OK;
                }
                beg = 0;
              }
              if (s.gzindex < s.gzhead.name.length) {
                val = s.gzhead.name.charCodeAt(s.gzindex++) & 255;
              } else {
                val = 0;
              }
              put_byte(s, val);
            } while (val !== 0);
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
            s.gzindex = 0;
          }
          s.status = COMMENT_STATE;
        }
        if (s.status === COMMENT_STATE) {
          if (s.gzhead.comment) {
            let beg = s.pending;
            let val;
            do {
              if (s.pending === s.pending_buf_size) {
                if (s.gzhead.hcrc && s.pending > beg) {
                  strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
                }
                flush_pending(strm);
                if (s.pending !== 0) {
                  s.last_flush = -1;
                  return Z_OK;
                }
                beg = 0;
              }
              if (s.gzindex < s.gzhead.comment.length) {
                val = s.gzhead.comment.charCodeAt(s.gzindex++) & 255;
              } else {
                val = 0;
              }
              put_byte(s, val);
            } while (val !== 0);
            if (s.gzhead.hcrc && s.pending > beg) {
              strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
            }
          }
          s.status = HCRC_STATE;
        }
        if (s.status === HCRC_STATE) {
          if (s.gzhead.hcrc) {
            if (s.pending + 2 > s.pending_buf_size) {
              flush_pending(strm);
              if (s.pending !== 0) {
                s.last_flush = -1;
                return Z_OK;
              }
            }
            put_byte(s, strm.adler & 255);
            put_byte(s, strm.adler >> 8 & 255);
            strm.adler = 0;
          }
          s.status = BUSY_STATE;
          flush_pending(strm);
          if (s.pending !== 0) {
            s.last_flush = -1;
            return Z_OK;
          }
        }
        if (strm.avail_in !== 0 || s.lookahead !== 0 || flush !== Z_NO_FLUSH && s.status !== FINISH_STATE) {
          let bstate = s.level === 0 ? deflate_stored(s, flush) : s.strategy === Z_HUFFMAN_ONLY ? deflate_huff(s, flush) : s.strategy === Z_RLE ? deflate_rle(s, flush) : configuration_table[s.level].func(s, flush);
          if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
            s.status = FINISH_STATE;
          }
          if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
            if (strm.avail_out === 0) {
              s.last_flush = -1;
            }
            return Z_OK;
          }
          if (bstate === BS_BLOCK_DONE) {
            if (flush === Z_PARTIAL_FLUSH) {
              _tr_align(s);
            } else if (flush !== Z_BLOCK) {
              _tr_stored_block(s, 0, 0, false);
              if (flush === Z_FULL_FLUSH) {
                zero(s.head);
                if (s.lookahead === 0) {
                  s.strstart = 0;
                  s.block_start = 0;
                  s.insert = 0;
                }
              }
            }
            flush_pending(strm);
            if (strm.avail_out === 0) {
              s.last_flush = -1;
              return Z_OK;
            }
          }
        }
        if (flush !== Z_FINISH) {
          return Z_OK;
        }
        if (s.wrap <= 0) {
          return Z_STREAM_END;
        }
        if (s.wrap === 2) {
          put_byte(s, strm.adler & 255);
          put_byte(s, strm.adler >> 8 & 255);
          put_byte(s, strm.adler >> 16 & 255);
          put_byte(s, strm.adler >> 24 & 255);
          put_byte(s, strm.total_in & 255);
          put_byte(s, strm.total_in >> 8 & 255);
          put_byte(s, strm.total_in >> 16 & 255);
          put_byte(s, strm.total_in >> 24 & 255);
        } else {
          putShortMSB(s, strm.adler >>> 16);
          putShortMSB(s, strm.adler & 65535);
        }
        flush_pending(strm);
        if (s.wrap > 0) {
          s.wrap = -s.wrap;
        }
        return s.pending !== 0 ? Z_OK : Z_STREAM_END;
      };
      var deflateEnd = (strm) => {
        if (deflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        const status = strm.state.status;
        strm.state = null;
        return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
      };
      var deflateSetDictionary = (strm, dictionary) => {
        let dictLength = dictionary.length;
        if (deflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        const s = strm.state;
        const wrap = s.wrap;
        if (wrap === 2 || wrap === 1 && s.status !== INIT_STATE || s.lookahead) {
          return Z_STREAM_ERROR;
        }
        if (wrap === 1) {
          strm.adler = adler32(strm.adler, dictionary, dictLength, 0);
        }
        s.wrap = 0;
        if (dictLength >= s.w_size) {
          if (wrap === 0) {
            zero(s.head);
            s.strstart = 0;
            s.block_start = 0;
            s.insert = 0;
          }
          let tmpDict = new Uint8Array(s.w_size);
          tmpDict.set(dictionary.subarray(dictLength - s.w_size, dictLength), 0);
          dictionary = tmpDict;
          dictLength = s.w_size;
        }
        const avail = strm.avail_in;
        const next = strm.next_in;
        const input = strm.input;
        strm.avail_in = dictLength;
        strm.next_in = 0;
        strm.input = dictionary;
        fill_window(s);
        while (s.lookahead >= MIN_MATCH) {
          let str = s.strstart;
          let n = s.lookahead - (MIN_MATCH - 1);
          do {
            s.ins_h = HASH(s, s.ins_h, s.window[str + MIN_MATCH - 1]);
            s.prev[str & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = str;
            str++;
          } while (--n);
          s.strstart = str;
          s.lookahead = MIN_MATCH - 1;
          fill_window(s);
        }
        s.strstart += s.lookahead;
        s.block_start = s.strstart;
        s.insert = s.lookahead;
        s.lookahead = 0;
        s.match_length = s.prev_length = MIN_MATCH - 1;
        s.match_available = 0;
        strm.next_in = next;
        strm.input = input;
        strm.avail_in = avail;
        s.wrap = wrap;
        return Z_OK;
      };
      module.exports.deflateInit = deflateInit;
      module.exports.deflateInit2 = deflateInit2;
      module.exports.deflateReset = deflateReset;
      module.exports.deflateResetKeep = deflateResetKeep;
      module.exports.deflateSetHeader = deflateSetHeader;
      module.exports.deflate = deflate;
      module.exports.deflateEnd = deflateEnd;
      module.exports.deflateSetDictionary = deflateSetDictionary;
      module.exports.deflateInfo = "pako deflate (from Nodeca project)";
    }
  });

  // tools/node_modules/pako/lib/utils/common.js
  var require_common = __commonJS({
    "tools/node_modules/pako/lib/utils/common.js"(exports, module) {
      "use strict";
      var _has = (obj, key) => {
        return Object.prototype.hasOwnProperty.call(obj, key);
      };
      module.exports.assign = function(obj) {
        const sources = Array.prototype.slice.call(arguments, 1);
        while (sources.length) {
          const source = sources.shift();
          if (!source) {
            continue;
          }
          if (typeof source !== "object") {
            throw new TypeError(source + "must be non-object");
          }
          for (const p in source) {
            if (_has(source, p)) {
              obj[p] = source[p];
            }
          }
        }
        return obj;
      };
      module.exports.flattenChunks = (chunks) => {
        let len = 0;
        for (let i = 0, l = chunks.length; i < l; i++) {
          len += chunks[i].length;
        }
        const result = new Uint8Array(len);
        for (let i = 0, pos = 0, l = chunks.length; i < l; i++) {
          let chunk = chunks[i];
          result.set(chunk, pos);
          pos += chunk.length;
        }
        return result;
      };
    }
  });

  // tools/node_modules/pako/lib/utils/strings.js
  var require_strings = __commonJS({
    "tools/node_modules/pako/lib/utils/strings.js"(exports, module) {
      "use strict";
      var STR_APPLY_UIA_OK = true;
      try {
        String.fromCharCode.apply(null, new Uint8Array(1));
      } catch (__) {
        STR_APPLY_UIA_OK = false;
      }
      var _utf8len = new Uint8Array(256);
      for (let q = 0; q < 256; q++) {
        _utf8len[q] = q >= 252 ? 6 : q >= 248 ? 5 : q >= 240 ? 4 : q >= 224 ? 3 : q >= 192 ? 2 : 1;
      }
      _utf8len[254] = _utf8len[254] = 1;
      module.exports.string2buf = (str) => {
        if (typeof TextEncoder === "function" && TextEncoder.prototype.encode) {
          return new TextEncoder().encode(str);
        }
        let buf, c, c2, m_pos, i, str_len = str.length, buf_len = 0;
        for (m_pos = 0; m_pos < str_len; m_pos++) {
          c = str.charCodeAt(m_pos);
          if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
            c2 = str.charCodeAt(m_pos + 1);
            if ((c2 & 64512) === 56320) {
              c = 65536 + (c - 55296 << 10) + (c2 - 56320);
              m_pos++;
            }
          }
          buf_len += c < 128 ? 1 : c < 2048 ? 2 : c < 65536 ? 3 : 4;
        }
        buf = new Uint8Array(buf_len);
        for (i = 0, m_pos = 0; i < buf_len; m_pos++) {
          c = str.charCodeAt(m_pos);
          if ((c & 64512) === 55296 && m_pos + 1 < str_len) {
            c2 = str.charCodeAt(m_pos + 1);
            if ((c2 & 64512) === 56320) {
              c = 65536 + (c - 55296 << 10) + (c2 - 56320);
              m_pos++;
            }
          }
          if (c < 128) {
            buf[i++] = c;
          } else if (c < 2048) {
            buf[i++] = 192 | c >>> 6;
            buf[i++] = 128 | c & 63;
          } else if (c < 65536) {
            buf[i++] = 224 | c >>> 12;
            buf[i++] = 128 | c >>> 6 & 63;
            buf[i++] = 128 | c & 63;
          } else {
            buf[i++] = 240 | c >>> 18;
            buf[i++] = 128 | c >>> 12 & 63;
            buf[i++] = 128 | c >>> 6 & 63;
            buf[i++] = 128 | c & 63;
          }
        }
        return buf;
      };
      var buf2binstring = (buf, len) => {
        if (len < 65534) {
          if (buf.subarray && STR_APPLY_UIA_OK) {
            return String.fromCharCode.apply(null, buf.length === len ? buf : buf.subarray(0, len));
          }
        }
        let result = "";
        for (let i = 0; i < len; i++) {
          result += String.fromCharCode(buf[i]);
        }
        return result;
      };
      module.exports.buf2string = (buf, max) => {
        const len = max || buf.length;
        if (typeof TextDecoder === "function" && TextDecoder.prototype.decode) {
          return new TextDecoder().decode(buf.subarray(0, max));
        }
        let i, out;
        const utf16buf = new Array(len * 2);
        for (out = 0, i = 0; i < len; ) {
          let c = buf[i++];
          if (c < 128) {
            utf16buf[out++] = c;
            continue;
          }
          let c_len = _utf8len[c];
          if (c_len > 4) {
            utf16buf[out++] = 65533;
            i += c_len - 1;
            continue;
          }
          c &= c_len === 2 ? 31 : c_len === 3 ? 15 : 7;
          while (c_len > 1 && i < len) {
            c = c << 6 | buf[i++] & 63;
            c_len--;
          }
          if (c_len > 1) {
            utf16buf[out++] = 65533;
            continue;
          }
          if (c < 65536) {
            utf16buf[out++] = c;
          } else {
            c -= 65536;
            utf16buf[out++] = 55296 | c >> 10 & 1023;
            utf16buf[out++] = 56320 | c & 1023;
          }
        }
        return buf2binstring(utf16buf, out);
      };
      module.exports.utf8border = (buf, max) => {
        max = max || buf.length;
        if (max > buf.length) {
          max = buf.length;
        }
        let pos = max - 1;
        while (pos >= 0 && (buf[pos] & 192) === 128) {
          pos--;
        }
        if (pos < 0) {
          return max;
        }
        if (pos === 0) {
          return max;
        }
        return pos + _utf8len[buf[pos]] > max ? pos : max;
      };
    }
  });

  // tools/node_modules/pako/lib/zlib/zstream.js
  var require_zstream = __commonJS({
    "tools/node_modules/pako/lib/zlib/zstream.js"(exports, module) {
      "use strict";
      function ZStream() {
        this.input = null;
        this.next_in = 0;
        this.avail_in = 0;
        this.total_in = 0;
        this.output = null;
        this.next_out = 0;
        this.avail_out = 0;
        this.total_out = 0;
        this.msg = "";
        this.state = null;
        this.data_type = 2;
        this.adler = 0;
      }
      module.exports = ZStream;
    }
  });

  // tools/node_modules/pako/lib/deflate.js
  var require_deflate2 = __commonJS({
    "tools/node_modules/pako/lib/deflate.js"(exports, module) {
      "use strict";
      var zlib_deflate = require_deflate();
      var utils = require_common();
      var strings = require_strings();
      var msg = require_messages();
      var ZStream = require_zstream();
      var toString = Object.prototype.toString;
      var {
        Z_NO_FLUSH,
        Z_SYNC_FLUSH,
        Z_FULL_FLUSH,
        Z_FINISH,
        Z_OK,
        Z_STREAM_END,
        Z_DEFAULT_COMPRESSION,
        Z_DEFAULT_STRATEGY,
        Z_DEFLATED
      } = require_constants();
      function Deflate(options) {
        this.options = utils.assign({
          level: Z_DEFAULT_COMPRESSION,
          method: Z_DEFLATED,
          chunkSize: 16384,
          windowBits: 15,
          memLevel: 8,
          strategy: Z_DEFAULT_STRATEGY
        }, options || {});
        let opt = this.options;
        if (opt.raw && opt.windowBits > 0) {
          opt.windowBits = -opt.windowBits;
        } else if (opt.gzip && opt.windowBits > 0 && opt.windowBits < 16) {
          opt.windowBits += 16;
        }
        this.err = 0;
        this.msg = "";
        this.ended = false;
        this.chunks = [];
        this.strm = new ZStream();
        this.strm.avail_out = 0;
        let status = zlib_deflate.deflateInit2(
          this.strm,
          opt.level,
          opt.method,
          opt.windowBits,
          opt.memLevel,
          opt.strategy
        );
        if (status !== Z_OK) {
          throw new Error(msg[status]);
        }
        if (opt.header) {
          zlib_deflate.deflateSetHeader(this.strm, opt.header);
        }
        if (opt.dictionary) {
          let dict;
          if (typeof opt.dictionary === "string") {
            dict = strings.string2buf(opt.dictionary);
          } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
            dict = new Uint8Array(opt.dictionary);
          } else {
            dict = opt.dictionary;
          }
          status = zlib_deflate.deflateSetDictionary(this.strm, dict);
          if (status !== Z_OK) {
            throw new Error(msg[status]);
          }
          this._dict_set = true;
        }
      }
      Deflate.prototype.push = function(data, flush_mode) {
        const strm = this.strm;
        const chunkSize = this.options.chunkSize;
        let status, _flush_mode;
        if (this.ended) {
          return false;
        }
        if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
        else _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;
        if (typeof data === "string") {
          strm.input = strings.string2buf(data);
        } else if (toString.call(data) === "[object ArrayBuffer]") {
          strm.input = new Uint8Array(data);
        } else {
          strm.input = data;
        }
        strm.next_in = 0;
        strm.avail_in = strm.input.length;
        for (; ; ) {
          if (strm.avail_out === 0) {
            strm.output = new Uint8Array(chunkSize);
            strm.next_out = 0;
            strm.avail_out = chunkSize;
          }
          if ((_flush_mode === Z_SYNC_FLUSH || _flush_mode === Z_FULL_FLUSH) && strm.avail_out <= 6) {
            this.onData(strm.output.subarray(0, strm.next_out));
            strm.avail_out = 0;
            continue;
          }
          status = zlib_deflate.deflate(strm, _flush_mode);
          if (status === Z_STREAM_END) {
            if (strm.next_out > 0) {
              this.onData(strm.output.subarray(0, strm.next_out));
            }
            status = zlib_deflate.deflateEnd(this.strm);
            this.onEnd(status);
            this.ended = true;
            return status === Z_OK;
          }
          if (strm.avail_out === 0) {
            this.onData(strm.output);
            continue;
          }
          if (_flush_mode > 0 && strm.next_out > 0) {
            this.onData(strm.output.subarray(0, strm.next_out));
            strm.avail_out = 0;
            continue;
          }
          if (strm.avail_in === 0) break;
        }
        return true;
      };
      Deflate.prototype.onData = function(chunk) {
        this.chunks.push(chunk);
      };
      Deflate.prototype.onEnd = function(status) {
        if (status === Z_OK) {
          this.result = utils.flattenChunks(this.chunks);
        }
        this.chunks = [];
        this.err = status;
        this.msg = this.strm.msg;
      };
      function deflate(input, options) {
        const deflator = new Deflate(options);
        deflator.push(input, true);
        if (deflator.err) {
          throw deflator.msg || msg[deflator.err];
        }
        return deflator.result;
      }
      function deflateRaw(input, options) {
        options = options || {};
        options.raw = true;
        return deflate(input, options);
      }
      function gzip(input, options) {
        options = options || {};
        options.gzip = true;
        return deflate(input, options);
      }
      module.exports.Deflate = Deflate;
      module.exports.deflate = deflate;
      module.exports.deflateRaw = deflateRaw;
      module.exports.gzip = gzip;
      module.exports.constants = require_constants();
    }
  });

  // tools/node_modules/pako/lib/zlib/inffast.js
  var require_inffast = __commonJS({
    "tools/node_modules/pako/lib/zlib/inffast.js"(exports, module) {
      "use strict";
      var BAD = 16209;
      var TYPE = 16191;
      module.exports = function inflate_fast(strm, start) {
        let _in;
        let last;
        let _out;
        let beg;
        let end;
        let dmax;
        let wsize;
        let whave;
        let wnext;
        let s_window;
        let hold;
        let bits;
        let lcode;
        let dcode;
        let lmask;
        let dmask;
        let here;
        let op;
        let len;
        let dist;
        let from;
        let from_source;
        let input, output;
        const state = strm.state;
        _in = strm.next_in;
        input = strm.input;
        last = _in + (strm.avail_in - 5);
        _out = strm.next_out;
        output = strm.output;
        beg = _out - (start - strm.avail_out);
        end = _out + (strm.avail_out - 257);
        dmax = state.dmax;
        wsize = state.wsize;
        whave = state.whave;
        wnext = state.wnext;
        s_window = state.window;
        hold = state.hold;
        bits = state.bits;
        lcode = state.lencode;
        dcode = state.distcode;
        lmask = (1 << state.lenbits) - 1;
        dmask = (1 << state.distbits) - 1;
        top:
          do {
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }
            here = lcode[hold & lmask];
            dolen:
              for (; ; ) {
                op = here >>> 24;
                hold >>>= op;
                bits -= op;
                op = here >>> 16 & 255;
                if (op === 0) {
                  output[_out++] = here & 65535;
                } else if (op & 16) {
                  len = here & 65535;
                  op &= 15;
                  if (op) {
                    if (bits < op) {
                      hold += input[_in++] << bits;
                      bits += 8;
                    }
                    len += hold & (1 << op) - 1;
                    hold >>>= op;
                    bits -= op;
                  }
                  if (bits < 15) {
                    hold += input[_in++] << bits;
                    bits += 8;
                    hold += input[_in++] << bits;
                    bits += 8;
                  }
                  here = dcode[hold & dmask];
                  dodist:
                    for (; ; ) {
                      op = here >>> 24;
                      hold >>>= op;
                      bits -= op;
                      op = here >>> 16 & 255;
                      if (op & 16) {
                        dist = here & 65535;
                        op &= 15;
                        if (bits < op) {
                          hold += input[_in++] << bits;
                          bits += 8;
                          if (bits < op) {
                            hold += input[_in++] << bits;
                            bits += 8;
                          }
                        }
                        dist += hold & (1 << op) - 1;
                        if (dist > dmax) {
                          strm.msg = "invalid distance too far back";
                          state.mode = BAD;
                          break top;
                        }
                        hold >>>= op;
                        bits -= op;
                        op = _out - beg;
                        if (dist > op) {
                          op = dist - op;
                          if (op > whave) {
                            if (state.sane) {
                              strm.msg = "invalid distance too far back";
                              state.mode = BAD;
                              break top;
                            }
                          }
                          from = 0;
                          from_source = s_window;
                          if (wnext === 0) {
                            from += wsize - op;
                            if (op < len) {
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = _out - dist;
                              from_source = output;
                            }
                          } else if (wnext < op) {
                            from += wsize + wnext - op;
                            op -= wnext;
                            if (op < len) {
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = 0;
                              if (wnext < len) {
                                op = wnext;
                                len -= op;
                                do {
                                  output[_out++] = s_window[from++];
                                } while (--op);
                                from = _out - dist;
                                from_source = output;
                              }
                            }
                          } else {
                            from += wnext - op;
                            if (op < len) {
                              len -= op;
                              do {
                                output[_out++] = s_window[from++];
                              } while (--op);
                              from = _out - dist;
                              from_source = output;
                            }
                          }
                          while (len > 2) {
                            output[_out++] = from_source[from++];
                            output[_out++] = from_source[from++];
                            output[_out++] = from_source[from++];
                            len -= 3;
                          }
                          if (len) {
                            output[_out++] = from_source[from++];
                            if (len > 1) {
                              output[_out++] = from_source[from++];
                            }
                          }
                        } else {
                          from = _out - dist;
                          do {
                            output[_out++] = output[from++];
                            output[_out++] = output[from++];
                            output[_out++] = output[from++];
                            len -= 3;
                          } while (len > 2);
                          if (len) {
                            output[_out++] = output[from++];
                            if (len > 1) {
                              output[_out++] = output[from++];
                            }
                          }
                        }
                      } else if ((op & 64) === 0) {
                        here = dcode[(here & 65535) + (hold & (1 << op) - 1)];
                        continue dodist;
                      } else {
                        strm.msg = "invalid distance code";
                        state.mode = BAD;
                        break top;
                      }
                      break;
                    }
                } else if ((op & 64) === 0) {
                  here = lcode[(here & 65535) + (hold & (1 << op) - 1)];
                  continue dolen;
                } else if (op & 32) {
                  state.mode = TYPE;
                  break top;
                } else {
                  strm.msg = "invalid literal/length code";
                  state.mode = BAD;
                  break top;
                }
                break;
              }
          } while (_in < last && _out < end);
        len = bits >> 3;
        _in -= len;
        bits -= len << 3;
        hold &= (1 << bits) - 1;
        strm.next_in = _in;
        strm.next_out = _out;
        strm.avail_in = _in < last ? 5 + (last - _in) : 5 - (_in - last);
        strm.avail_out = _out < end ? 257 + (end - _out) : 257 - (_out - end);
        state.hold = hold;
        state.bits = bits;
        return;
      };
    }
  });

  // tools/node_modules/pako/lib/zlib/inftrees.js
  var require_inftrees = __commonJS({
    "tools/node_modules/pako/lib/zlib/inftrees.js"(exports, module) {
      "use strict";
      var MAXBITS = 15;
      var ENOUGH_LENS = 852;
      var ENOUGH_DISTS = 592;
      var CODES = 0;
      var LENS = 1;
      var DISTS = 2;
      var lbase = new Uint16Array([
        /* Length codes 257..285 base */
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        13,
        15,
        17,
        19,
        23,
        27,
        31,
        35,
        43,
        51,
        59,
        67,
        83,
        99,
        115,
        131,
        163,
        195,
        227,
        258,
        0,
        0
      ]);
      var lext = new Uint8Array([
        /* Length codes 257..285 extra */
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        16,
        17,
        17,
        17,
        17,
        18,
        18,
        18,
        18,
        19,
        19,
        19,
        19,
        20,
        20,
        20,
        20,
        21,
        21,
        21,
        21,
        16,
        72,
        78
      ]);
      var dbase = new Uint16Array([
        /* Distance codes 0..29 base */
        1,
        2,
        3,
        4,
        5,
        7,
        9,
        13,
        17,
        25,
        33,
        49,
        65,
        97,
        129,
        193,
        257,
        385,
        513,
        769,
        1025,
        1537,
        2049,
        3073,
        4097,
        6145,
        8193,
        12289,
        16385,
        24577,
        0,
        0
      ]);
      var dext = new Uint8Array([
        /* Distance codes 0..29 extra */
        16,
        16,
        16,
        16,
        17,
        17,
        18,
        18,
        19,
        19,
        20,
        20,
        21,
        21,
        22,
        22,
        23,
        23,
        24,
        24,
        25,
        25,
        26,
        26,
        27,
        27,
        28,
        28,
        29,
        29,
        64,
        64
      ]);
      var inflate_table = (type, lens, lens_index, codes, table, table_index, work, opts) => {
        const bits = opts.bits;
        let len = 0;
        let sym = 0;
        let min = 0, max = 0;
        let root = 0;
        let curr = 0;
        let drop = 0;
        let left = 0;
        let used = 0;
        let huff = 0;
        let incr;
        let fill;
        let low;
        let mask;
        let next;
        let base = null;
        let match;
        const count = new Uint16Array(MAXBITS + 1);
        const offs = new Uint16Array(MAXBITS + 1);
        let extra = null;
        let here_bits, here_op, here_val;
        for (len = 0; len <= MAXBITS; len++) {
          count[len] = 0;
        }
        for (sym = 0; sym < codes; sym++) {
          count[lens[lens_index + sym]]++;
        }
        root = bits;
        for (max = MAXBITS; max >= 1; max--) {
          if (count[max] !== 0) {
            break;
          }
        }
        if (root > max) {
          root = max;
        }
        if (max === 0) {
          table[table_index++] = 1 << 24 | 64 << 16 | 0;
          table[table_index++] = 1 << 24 | 64 << 16 | 0;
          opts.bits = 1;
          return 0;
        }
        for (min = 1; min < max; min++) {
          if (count[min] !== 0) {
            break;
          }
        }
        if (root < min) {
          root = min;
        }
        left = 1;
        for (len = 1; len <= MAXBITS; len++) {
          left <<= 1;
          left -= count[len];
          if (left < 0) {
            return -1;
          }
        }
        if (left > 0 && (type === CODES || max !== 1)) {
          return -1;
        }
        offs[1] = 0;
        for (len = 1; len < MAXBITS; len++) {
          offs[len + 1] = offs[len] + count[len];
        }
        for (sym = 0; sym < codes; sym++) {
          if (lens[lens_index + sym] !== 0) {
            work[offs[lens[lens_index + sym]]++] = sym;
          }
        }
        if (type === CODES) {
          base = extra = work;
          match = 20;
        } else if (type === LENS) {
          base = lbase;
          extra = lext;
          match = 257;
        } else {
          base = dbase;
          extra = dext;
          match = 0;
        }
        huff = 0;
        sym = 0;
        len = min;
        next = table_index;
        curr = root;
        drop = 0;
        low = -1;
        used = 1 << root;
        mask = used - 1;
        if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
          return 1;
        }
        for (; ; ) {
          here_bits = len - drop;
          if (work[sym] + 1 < match) {
            here_op = 0;
            here_val = work[sym];
          } else if (work[sym] >= match) {
            here_op = extra[work[sym] - match];
            here_val = base[work[sym] - match];
          } else {
            here_op = 32 + 64;
            here_val = 0;
          }
          incr = 1 << len - drop;
          fill = 1 << curr;
          min = fill;
          do {
            fill -= incr;
            table[next + (huff >> drop) + fill] = here_bits << 24 | here_op << 16 | here_val | 0;
          } while (fill !== 0);
          incr = 1 << len - 1;
          while (huff & incr) {
            incr >>= 1;
          }
          if (incr !== 0) {
            huff &= incr - 1;
            huff += incr;
          } else {
            huff = 0;
          }
          sym++;
          if (--count[len] === 0) {
            if (len === max) {
              break;
            }
            len = lens[lens_index + work[sym]];
          }
          if (len > root && (huff & mask) !== low) {
            if (drop === 0) {
              drop = root;
            }
            next += min;
            curr = len - drop;
            left = 1 << curr;
            while (curr + drop < max) {
              left -= count[curr + drop];
              if (left <= 0) {
                break;
              }
              curr++;
              left <<= 1;
            }
            used += 1 << curr;
            if (type === LENS && used > ENOUGH_LENS || type === DISTS && used > ENOUGH_DISTS) {
              return 1;
            }
            low = huff & mask;
            table[low] = root << 24 | curr << 16 | next - table_index | 0;
          }
        }
        if (huff !== 0) {
          table[next + huff] = len - drop << 24 | 64 << 16 | 0;
        }
        opts.bits = root;
        return 0;
      };
      module.exports = inflate_table;
    }
  });

  // tools/node_modules/pako/lib/zlib/inflate.js
  var require_inflate = __commonJS({
    "tools/node_modules/pako/lib/zlib/inflate.js"(exports, module) {
      "use strict";
      var adler32 = require_adler32();
      var crc32 = require_crc32();
      var inflate_fast = require_inffast();
      var inflate_table = require_inftrees();
      var CODES = 0;
      var LENS = 1;
      var DISTS = 2;
      var {
        Z_FINISH,
        Z_BLOCK,
        Z_TREES,
        Z_OK,
        Z_STREAM_END,
        Z_NEED_DICT,
        Z_STREAM_ERROR,
        Z_DATA_ERROR,
        Z_MEM_ERROR,
        Z_BUF_ERROR,
        Z_DEFLATED
      } = require_constants();
      var HEAD = 16180;
      var FLAGS = 16181;
      var TIME = 16182;
      var OS = 16183;
      var EXLEN = 16184;
      var EXTRA = 16185;
      var NAME = 16186;
      var COMMENT = 16187;
      var HCRC = 16188;
      var DICTID = 16189;
      var DICT = 16190;
      var TYPE = 16191;
      var TYPEDO = 16192;
      var STORED = 16193;
      var COPY_ = 16194;
      var COPY = 16195;
      var TABLE = 16196;
      var LENLENS = 16197;
      var CODELENS = 16198;
      var LEN_ = 16199;
      var LEN = 16200;
      var LENEXT = 16201;
      var DIST = 16202;
      var DISTEXT = 16203;
      var MATCH = 16204;
      var LIT = 16205;
      var CHECK = 16206;
      var LENGTH = 16207;
      var DONE = 16208;
      var BAD = 16209;
      var MEM = 16210;
      var SYNC = 16211;
      var ENOUGH_LENS = 852;
      var ENOUGH_DISTS = 592;
      var MAX_WBITS = 15;
      var DEF_WBITS = MAX_WBITS;
      var zswap32 = (q) => {
        return (q >>> 24 & 255) + (q >>> 8 & 65280) + ((q & 65280) << 8) + ((q & 255) << 24);
      };
      function InflateState() {
        this.strm = null;
        this.mode = 0;
        this.last = false;
        this.wrap = 0;
        this.havedict = false;
        this.flags = 0;
        this.dmax = 0;
        this.check = 0;
        this.total = 0;
        this.head = null;
        this.wbits = 0;
        this.wsize = 0;
        this.whave = 0;
        this.wnext = 0;
        this.window = null;
        this.hold = 0;
        this.bits = 0;
        this.length = 0;
        this.offset = 0;
        this.extra = 0;
        this.lencode = null;
        this.distcode = null;
        this.lenbits = 0;
        this.distbits = 0;
        this.ncode = 0;
        this.nlen = 0;
        this.ndist = 0;
        this.have = 0;
        this.next = null;
        this.lens = new Uint16Array(320);
        this.work = new Uint16Array(288);
        this.lendyn = null;
        this.distdyn = null;
        this.sane = 0;
        this.back = 0;
        this.was = 0;
      }
      var inflateStateCheck = (strm) => {
        if (!strm) {
          return 1;
        }
        const state = strm.state;
        if (!state || state.strm !== strm || state.mode < HEAD || state.mode > SYNC) {
          return 1;
        }
        return 0;
      };
      var inflateResetKeep = (strm) => {
        if (inflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        const state = strm.state;
        strm.total_in = strm.total_out = state.total = 0;
        strm.msg = "";
        if (state.wrap) {
          strm.adler = state.wrap & 1;
        }
        state.mode = HEAD;
        state.last = 0;
        state.havedict = 0;
        state.flags = -1;
        state.dmax = 32768;
        state.head = null;
        state.hold = 0;
        state.bits = 0;
        state.lencode = state.lendyn = new Int32Array(ENOUGH_LENS);
        state.distcode = state.distdyn = new Int32Array(ENOUGH_DISTS);
        state.sane = 1;
        state.back = -1;
        return Z_OK;
      };
      var inflateReset = (strm) => {
        if (inflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        const state = strm.state;
        state.wsize = 0;
        state.whave = 0;
        state.wnext = 0;
        return inflateResetKeep(strm);
      };
      var inflateReset2 = (strm, windowBits) => {
        let wrap;
        if (inflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        const state = strm.state;
        if (windowBits < 0) {
          wrap = 0;
          windowBits = -windowBits;
        } else {
          wrap = (windowBits >> 4) + 5;
          if (windowBits < 48) {
            windowBits &= 15;
          }
        }
        if (windowBits && (windowBits < 8 || windowBits > 15)) {
          return Z_STREAM_ERROR;
        }
        if (state.window !== null && state.wbits !== windowBits) {
          state.window = null;
        }
        state.wrap = wrap;
        state.wbits = windowBits;
        return inflateReset(strm);
      };
      var inflateInit2 = (strm, windowBits) => {
        if (!strm) {
          return Z_STREAM_ERROR;
        }
        const state = new InflateState();
        strm.state = state;
        state.strm = strm;
        state.window = null;
        state.mode = HEAD;
        const ret = inflateReset2(strm, windowBits);
        if (ret !== Z_OK) {
          strm.state = null;
        }
        return ret;
      };
      var inflateInit = (strm) => {
        return inflateInit2(strm, DEF_WBITS);
      };
      var virgin = true;
      var lenfix;
      var distfix;
      var fixedtables = (state) => {
        if (virgin) {
          lenfix = new Int32Array(512);
          distfix = new Int32Array(32);
          let sym = 0;
          while (sym < 144) {
            state.lens[sym++] = 8;
          }
          while (sym < 256) {
            state.lens[sym++] = 9;
          }
          while (sym < 280) {
            state.lens[sym++] = 7;
          }
          while (sym < 288) {
            state.lens[sym++] = 8;
          }
          inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, { bits: 9 });
          sym = 0;
          while (sym < 32) {
            state.lens[sym++] = 5;
          }
          inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, { bits: 5 });
          virgin = false;
        }
        state.lencode = lenfix;
        state.lenbits = 9;
        state.distcode = distfix;
        state.distbits = 5;
      };
      var updatewindow = (strm, src, end, copy) => {
        let dist;
        const state = strm.state;
        if (state.window === null) {
          state.wsize = 1 << state.wbits;
          state.wnext = 0;
          state.whave = 0;
          state.window = new Uint8Array(state.wsize);
        }
        if (copy >= state.wsize) {
          state.window.set(src.subarray(end - state.wsize, end), 0);
          state.wnext = 0;
          state.whave = state.wsize;
        } else {
          dist = state.wsize - state.wnext;
          if (dist > copy) {
            dist = copy;
          }
          state.window.set(src.subarray(end - copy, end - copy + dist), state.wnext);
          copy -= dist;
          if (copy) {
            state.window.set(src.subarray(end - copy, end), 0);
            state.wnext = copy;
            state.whave = state.wsize;
          } else {
            state.wnext += dist;
            if (state.wnext === state.wsize) {
              state.wnext = 0;
            }
            if (state.whave < state.wsize) {
              state.whave += dist;
            }
          }
        }
        return 0;
      };
      var inflate = (strm, flush) => {
        let state;
        let input, output;
        let next;
        let put;
        let have, left;
        let hold;
        let bits;
        let _in, _out;
        let copy;
        let from;
        let from_source;
        let here = 0;
        let here_bits, here_op, here_val;
        let last_bits, last_op, last_val;
        let len;
        let ret;
        const hbuf = new Uint8Array(4);
        let opts;
        let n;
        const order = (
          /* permutation of code lengths */
          new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15])
        );
        if (inflateStateCheck(strm) || !strm.output || !strm.input && strm.avail_in !== 0) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        if (state.mode === TYPE) {
          state.mode = TYPEDO;
        }
        put = strm.next_out;
        output = strm.output;
        left = strm.avail_out;
        next = strm.next_in;
        input = strm.input;
        have = strm.avail_in;
        hold = state.hold;
        bits = state.bits;
        _in = have;
        _out = left;
        ret = Z_OK;
        inf_leave:
          for (; ; ) {
            switch (state.mode) {
              case HEAD:
                if (state.wrap === 0) {
                  state.mode = TYPEDO;
                  break;
                }
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.wrap & 2 && hold === 35615) {
                  if (state.wbits === 0) {
                    state.wbits = 15;
                  }
                  state.check = 0;
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                  hold = 0;
                  bits = 0;
                  state.mode = FLAGS;
                  break;
                }
                if (state.head) {
                  state.head.done = false;
                }
                if (!(state.wrap & 1) || /* check if zlib header allowed */
                (((hold & 255) << 8) + (hold >> 8)) % 31) {
                  strm.msg = "incorrect header check";
                  state.mode = BAD;
                  break;
                }
                if ((hold & 15) !== Z_DEFLATED) {
                  strm.msg = "unknown compression method";
                  state.mode = BAD;
                  break;
                }
                hold >>>= 4;
                bits -= 4;
                len = (hold & 15) + 8;
                if (state.wbits === 0) {
                  state.wbits = len;
                }
                if (len > 15 || len > state.wbits) {
                  strm.msg = "invalid window size";
                  state.mode = BAD;
                  break;
                }
                state.dmax = 1 << state.wbits;
                state.flags = 0;
                strm.adler = state.check = 1;
                state.mode = hold & 512 ? DICTID : TYPE;
                hold = 0;
                bits = 0;
                break;
              case FLAGS:
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.flags = hold;
                if ((state.flags & 255) !== Z_DEFLATED) {
                  strm.msg = "unknown compression method";
                  state.mode = BAD;
                  break;
                }
                if (state.flags & 57344) {
                  strm.msg = "unknown header flags set";
                  state.mode = BAD;
                  break;
                }
                if (state.head) {
                  state.head.text = hold >> 8 & 1;
                }
                if (state.flags & 512 && state.wrap & 4) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = TIME;
              /* falls through */
              case TIME:
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.head) {
                  state.head.time = hold;
                }
                if (state.flags & 512 && state.wrap & 4) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  hbuf[2] = hold >>> 16 & 255;
                  hbuf[3] = hold >>> 24 & 255;
                  state.check = crc32(state.check, hbuf, 4, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = OS;
              /* falls through */
              case OS:
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (state.head) {
                  state.head.xflags = hold & 255;
                  state.head.os = hold >> 8;
                }
                if (state.flags & 512 && state.wrap & 4) {
                  hbuf[0] = hold & 255;
                  hbuf[1] = hold >>> 8 & 255;
                  state.check = crc32(state.check, hbuf, 2, 0);
                }
                hold = 0;
                bits = 0;
                state.mode = EXLEN;
              /* falls through */
              case EXLEN:
                if (state.flags & 1024) {
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.length = hold;
                  if (state.head) {
                    state.head.extra_len = hold;
                  }
                  if (state.flags & 512 && state.wrap & 4) {
                    hbuf[0] = hold & 255;
                    hbuf[1] = hold >>> 8 & 255;
                    state.check = crc32(state.check, hbuf, 2, 0);
                  }
                  hold = 0;
                  bits = 0;
                } else if (state.head) {
                  state.head.extra = null;
                }
                state.mode = EXTRA;
              /* falls through */
              case EXTRA:
                if (state.flags & 1024) {
                  copy = state.length;
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy) {
                    if (state.head) {
                      len = state.head.extra_len - state.length;
                      if (!state.head.extra) {
                        state.head.extra = new Uint8Array(state.head.extra_len);
                      }
                      state.head.extra.set(
                        input.subarray(
                          next,
                          // extra field is limited to 65536 bytes
                          // - no need for additional size check
                          next + copy
                        ),
                        /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                        len
                      );
                    }
                    if (state.flags & 512 && state.wrap & 4) {
                      state.check = crc32(state.check, input, copy, next);
                    }
                    have -= copy;
                    next += copy;
                    state.length -= copy;
                  }
                  if (state.length) {
                    break inf_leave;
                  }
                }
                state.length = 0;
                state.mode = NAME;
              /* falls through */
              case NAME:
                if (state.flags & 2048) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    len = input[next + copy++];
                    if (state.head && len && state.length < 65536) {
                      state.head.name += String.fromCharCode(len);
                    }
                  } while (len && copy < have);
                  if (state.flags & 512 && state.wrap & 4) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.name = null;
                }
                state.length = 0;
                state.mode = COMMENT;
              /* falls through */
              case COMMENT:
                if (state.flags & 4096) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    len = input[next + copy++];
                    if (state.head && len && state.length < 65536) {
                      state.head.comment += String.fromCharCode(len);
                    }
                  } while (len && copy < have);
                  if (state.flags & 512 && state.wrap & 4) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                } else if (state.head) {
                  state.head.comment = null;
                }
                state.mode = HCRC;
              /* falls through */
              case HCRC:
                if (state.flags & 512) {
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (state.wrap & 4 && hold !== (state.check & 65535)) {
                    strm.msg = "header crc mismatch";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                if (state.head) {
                  state.head.hcrc = state.flags >> 9 & 1;
                  state.head.done = true;
                }
                strm.adler = state.check = 0;
                state.mode = TYPE;
                break;
              case DICTID:
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                strm.adler = state.check = zswap32(hold);
                hold = 0;
                bits = 0;
                state.mode = DICT;
              /* falls through */
              case DICT:
                if (state.havedict === 0) {
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  return Z_NEED_DICT;
                }
                strm.adler = state.check = 1;
                state.mode = TYPE;
              /* falls through */
              case TYPE:
                if (flush === Z_BLOCK || flush === Z_TREES) {
                  break inf_leave;
                }
              /* falls through */
              case TYPEDO:
                if (state.last) {
                  hold >>>= bits & 7;
                  bits -= bits & 7;
                  state.mode = CHECK;
                  break;
                }
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.last = hold & 1;
                hold >>>= 1;
                bits -= 1;
                switch (hold & 3) {
                  case 0:
                    state.mode = STORED;
                    break;
                  case 1:
                    fixedtables(state);
                    state.mode = LEN_;
                    if (flush === Z_TREES) {
                      hold >>>= 2;
                      bits -= 2;
                      break inf_leave;
                    }
                    break;
                  case 2:
                    state.mode = TABLE;
                    break;
                  case 3:
                    strm.msg = "invalid block type";
                    state.mode = BAD;
                }
                hold >>>= 2;
                bits -= 2;
                break;
              case STORED:
                hold >>>= bits & 7;
                bits -= bits & 7;
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if ((hold & 65535) !== (hold >>> 16 ^ 65535)) {
                  strm.msg = "invalid stored block lengths";
                  state.mode = BAD;
                  break;
                }
                state.length = hold & 65535;
                hold = 0;
                bits = 0;
                state.mode = COPY_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
              /* falls through */
              case COPY_:
                state.mode = COPY;
              /* falls through */
              case COPY:
                copy = state.length;
                if (copy) {
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy > left) {
                    copy = left;
                  }
                  if (copy === 0) {
                    break inf_leave;
                  }
                  output.set(input.subarray(next, next + copy), put);
                  have -= copy;
                  next += copy;
                  left -= copy;
                  put += copy;
                  state.length -= copy;
                  break;
                }
                state.mode = TYPE;
                break;
              case TABLE:
                while (bits < 14) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                state.nlen = (hold & 31) + 257;
                hold >>>= 5;
                bits -= 5;
                state.ndist = (hold & 31) + 1;
                hold >>>= 5;
                bits -= 5;
                state.ncode = (hold & 15) + 4;
                hold >>>= 4;
                bits -= 4;
                if (state.nlen > 286 || state.ndist > 30) {
                  strm.msg = "too many length or distance symbols";
                  state.mode = BAD;
                  break;
                }
                state.have = 0;
                state.mode = LENLENS;
              /* falls through */
              case LENLENS:
                while (state.have < state.ncode) {
                  while (bits < 3) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.lens[order[state.have++]] = hold & 7;
                  hold >>>= 3;
                  bits -= 3;
                }
                while (state.have < 19) {
                  state.lens[order[state.have++]] = 0;
                }
                state.lencode = state.lendyn;
                state.lenbits = 7;
                opts = { bits: state.lenbits };
                ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
                state.lenbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid code lengths set";
                  state.mode = BAD;
                  break;
                }
                state.have = 0;
                state.mode = CODELENS;
              /* falls through */
              case CODELENS:
                while (state.have < state.nlen + state.ndist) {
                  for (; ; ) {
                    here = state.lencode[hold & (1 << state.lenbits) - 1];
                    here_bits = here >>> 24;
                    here_op = here >>> 16 & 255;
                    here_val = here & 65535;
                    if (here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (here_val < 16) {
                    hold >>>= here_bits;
                    bits -= here_bits;
                    state.lens[state.have++] = here_val;
                  } else {
                    if (here_val === 16) {
                      n = here_bits + 2;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      if (state.have === 0) {
                        strm.msg = "invalid bit length repeat";
                        state.mode = BAD;
                        break;
                      }
                      len = state.lens[state.have - 1];
                      copy = 3 + (hold & 3);
                      hold >>>= 2;
                      bits -= 2;
                    } else if (here_val === 17) {
                      n = here_bits + 3;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      len = 0;
                      copy = 3 + (hold & 7);
                      hold >>>= 3;
                      bits -= 3;
                    } else {
                      n = here_bits + 7;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      hold >>>= here_bits;
                      bits -= here_bits;
                      len = 0;
                      copy = 11 + (hold & 127);
                      hold >>>= 7;
                      bits -= 7;
                    }
                    if (state.have + copy > state.nlen + state.ndist) {
                      strm.msg = "invalid bit length repeat";
                      state.mode = BAD;
                      break;
                    }
                    while (copy--) {
                      state.lens[state.have++] = len;
                    }
                  }
                }
                if (state.mode === BAD) {
                  break;
                }
                if (state.lens[256] === 0) {
                  strm.msg = "invalid code -- missing end-of-block";
                  state.mode = BAD;
                  break;
                }
                state.lenbits = 9;
                opts = { bits: state.lenbits };
                ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
                state.lenbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid literal/lengths set";
                  state.mode = BAD;
                  break;
                }
                state.distbits = 6;
                state.distcode = state.distdyn;
                opts = { bits: state.distbits };
                ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
                state.distbits = opts.bits;
                if (ret) {
                  strm.msg = "invalid distances set";
                  state.mode = BAD;
                  break;
                }
                state.mode = LEN_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
              /* falls through */
              case LEN_:
                state.mode = LEN;
              /* falls through */
              case LEN:
                if (have >= 6 && left >= 258) {
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  inflate_fast(strm, _out);
                  put = strm.next_out;
                  output = strm.output;
                  left = strm.avail_out;
                  next = strm.next_in;
                  input = strm.input;
                  have = strm.avail_in;
                  hold = state.hold;
                  bits = state.bits;
                  if (state.mode === TYPE) {
                    state.back = -1;
                  }
                  break;
                }
                state.back = 0;
                for (; ; ) {
                  here = state.lencode[hold & (1 << state.lenbits) - 1];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if (here_op && (here_op & 240) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (; ; ) {
                    here = state.lencode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                    here_bits = here >>> 24;
                    here_op = here >>> 16 & 255;
                    here_val = here & 65535;
                    if (last_bits + here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= last_bits;
                  bits -= last_bits;
                  state.back += last_bits;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                state.back += here_bits;
                state.length = here_val;
                if (here_op === 0) {
                  state.mode = LIT;
                  break;
                }
                if (here_op & 32) {
                  state.back = -1;
                  state.mode = TYPE;
                  break;
                }
                if (here_op & 64) {
                  strm.msg = "invalid literal/length code";
                  state.mode = BAD;
                  break;
                }
                state.extra = here_op & 15;
                state.mode = LENEXT;
              /* falls through */
              case LENEXT:
                if (state.extra) {
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.length += hold & (1 << state.extra) - 1;
                  hold >>>= state.extra;
                  bits -= state.extra;
                  state.back += state.extra;
                }
                state.was = state.length;
                state.mode = DIST;
              /* falls through */
              case DIST:
                for (; ; ) {
                  here = state.distcode[hold & (1 << state.distbits) - 1];
                  here_bits = here >>> 24;
                  here_op = here >>> 16 & 255;
                  here_val = here & 65535;
                  if (here_bits <= bits) {
                    break;
                  }
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                if ((here_op & 240) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (; ; ) {
                    here = state.distcode[last_val + ((hold & (1 << last_bits + last_op) - 1) >> last_bits)];
                    here_bits = here >>> 24;
                    here_op = here >>> 16 & 255;
                    here_val = here & 65535;
                    if (last_bits + here_bits <= bits) {
                      break;
                    }
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  hold >>>= last_bits;
                  bits -= last_bits;
                  state.back += last_bits;
                }
                hold >>>= here_bits;
                bits -= here_bits;
                state.back += here_bits;
                if (here_op & 64) {
                  strm.msg = "invalid distance code";
                  state.mode = BAD;
                  break;
                }
                state.offset = here_val;
                state.extra = here_op & 15;
                state.mode = DISTEXT;
              /* falls through */
              case DISTEXT:
                if (state.extra) {
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  state.offset += hold & (1 << state.extra) - 1;
                  hold >>>= state.extra;
                  bits -= state.extra;
                  state.back += state.extra;
                }
                if (state.offset > state.dmax) {
                  strm.msg = "invalid distance too far back";
                  state.mode = BAD;
                  break;
                }
                state.mode = MATCH;
              /* falls through */
              case MATCH:
                if (left === 0) {
                  break inf_leave;
                }
                copy = _out - left;
                if (state.offset > copy) {
                  copy = state.offset - copy;
                  if (copy > state.whave) {
                    if (state.sane) {
                      strm.msg = "invalid distance too far back";
                      state.mode = BAD;
                      break;
                    }
                  }
                  if (copy > state.wnext) {
                    copy -= state.wnext;
                    from = state.wsize - copy;
                  } else {
                    from = state.wnext - copy;
                  }
                  if (copy > state.length) {
                    copy = state.length;
                  }
                  from_source = state.window;
                } else {
                  from_source = output;
                  from = put - state.offset;
                  copy = state.length;
                }
                if (copy > left) {
                  copy = left;
                }
                left -= copy;
                state.length -= copy;
                do {
                  output[put++] = from_source[from++];
                } while (--copy);
                if (state.length === 0) {
                  state.mode = LEN;
                }
                break;
              case LIT:
                if (left === 0) {
                  break inf_leave;
                }
                output[put++] = state.length;
                left--;
                state.mode = LEN;
                break;
              case CHECK:
                if (state.wrap) {
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold |= input[next++] << bits;
                    bits += 8;
                  }
                  _out -= left;
                  strm.total_out += _out;
                  state.total += _out;
                  if (state.wrap & 4 && _out) {
                    strm.adler = state.check = /*UPDATE_CHECK(state.check, put - _out, _out);*/
                    state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out);
                  }
                  _out = left;
                  if (state.wrap & 4 && (state.flags ? hold : zswap32(hold)) !== state.check) {
                    strm.msg = "incorrect data check";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                state.mode = LENGTH;
              /* falls through */
              case LENGTH:
                if (state.wrap && state.flags) {
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  if (state.wrap & 4 && hold !== (state.total & 4294967295)) {
                    strm.msg = "incorrect length check";
                    state.mode = BAD;
                    break;
                  }
                  hold = 0;
                  bits = 0;
                }
                state.mode = DONE;
              /* falls through */
              case DONE:
                ret = Z_STREAM_END;
                break inf_leave;
              case BAD:
                ret = Z_DATA_ERROR;
                break inf_leave;
              case MEM:
                return Z_MEM_ERROR;
              case SYNC:
              /* falls through */
              default:
                return Z_STREAM_ERROR;
            }
          }
        strm.next_out = put;
        strm.avail_out = left;
        strm.next_in = next;
        strm.avail_in = have;
        state.hold = hold;
        state.bits = bits;
        if (state.wsize || _out !== strm.avail_out && state.mode < BAD && (state.mode < CHECK || flush !== Z_FINISH)) {
          if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
            state.mode = MEM;
            return Z_MEM_ERROR;
          }
        }
        _in -= strm.avail_in;
        _out -= strm.avail_out;
        strm.total_in += _in;
        strm.total_out += _out;
        state.total += _out;
        if (state.wrap & 4 && _out) {
          strm.adler = state.check = /*UPDATE_CHECK(state.check, strm.next_out - _out, _out);*/
          state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out);
        }
        strm.data_type = state.bits + (state.last ? 64 : 0) + (state.mode === TYPE ? 128 : 0) + (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
        if ((_in === 0 && _out === 0 || flush === Z_FINISH) && ret === Z_OK) {
          ret = Z_BUF_ERROR;
        }
        return ret;
      };
      var inflateEnd = (strm) => {
        if (inflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        let state = strm.state;
        if (state.window) {
          state.window = null;
        }
        strm.state = null;
        return Z_OK;
      };
      var inflateGetHeader = (strm, head) => {
        if (inflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        const state = strm.state;
        if ((state.wrap & 2) === 0) {
          return Z_STREAM_ERROR;
        }
        state.head = head;
        head.done = false;
        return Z_OK;
      };
      var inflateSetDictionary = (strm, dictionary) => {
        const dictLength = dictionary.length;
        let state;
        let dictid;
        let ret;
        if (inflateStateCheck(strm)) {
          return Z_STREAM_ERROR;
        }
        state = strm.state;
        if (state.wrap !== 0 && state.mode !== DICT) {
          return Z_STREAM_ERROR;
        }
        if (state.mode === DICT) {
          dictid = 1;
          dictid = adler32(dictid, dictionary, dictLength, 0);
          if (dictid !== state.check) {
            return Z_DATA_ERROR;
          }
        }
        ret = updatewindow(strm, dictionary, dictLength, dictLength);
        if (ret) {
          state.mode = MEM;
          return Z_MEM_ERROR;
        }
        state.havedict = 1;
        return Z_OK;
      };
      module.exports.inflateReset = inflateReset;
      module.exports.inflateReset2 = inflateReset2;
      module.exports.inflateResetKeep = inflateResetKeep;
      module.exports.inflateInit = inflateInit;
      module.exports.inflateInit2 = inflateInit2;
      module.exports.inflate = inflate;
      module.exports.inflateEnd = inflateEnd;
      module.exports.inflateGetHeader = inflateGetHeader;
      module.exports.inflateSetDictionary = inflateSetDictionary;
      module.exports.inflateInfo = "pako inflate (from Nodeca project)";
    }
  });

  // tools/node_modules/pako/lib/zlib/gzheader.js
  var require_gzheader = __commonJS({
    "tools/node_modules/pako/lib/zlib/gzheader.js"(exports, module) {
      "use strict";
      function GZheader() {
        this.text = 0;
        this.time = 0;
        this.xflags = 0;
        this.os = 0;
        this.extra = null;
        this.extra_len = 0;
        this.name = "";
        this.comment = "";
        this.hcrc = 0;
        this.done = false;
      }
      module.exports = GZheader;
    }
  });

  // tools/node_modules/pako/lib/inflate.js
  var require_inflate2 = __commonJS({
    "tools/node_modules/pako/lib/inflate.js"(exports, module) {
      "use strict";
      var zlib_inflate = require_inflate();
      var utils = require_common();
      var strings = require_strings();
      var msg = require_messages();
      var ZStream = require_zstream();
      var GZheader = require_gzheader();
      var toString = Object.prototype.toString;
      var {
        Z_NO_FLUSH,
        Z_FINISH,
        Z_OK,
        Z_STREAM_END,
        Z_NEED_DICT,
        Z_STREAM_ERROR,
        Z_DATA_ERROR,
        Z_MEM_ERROR
      } = require_constants();
      function Inflate(options) {
        this.options = utils.assign({
          chunkSize: 1024 * 64,
          windowBits: 15,
          to: ""
        }, options || {});
        const opt = this.options;
        if (opt.raw && opt.windowBits >= 0 && opt.windowBits < 16) {
          opt.windowBits = -opt.windowBits;
          if (opt.windowBits === 0) {
            opt.windowBits = -15;
          }
        }
        if (opt.windowBits >= 0 && opt.windowBits < 16 && !(options && options.windowBits)) {
          opt.windowBits += 32;
        }
        if (opt.windowBits > 15 && opt.windowBits < 48) {
          if ((opt.windowBits & 15) === 0) {
            opt.windowBits |= 15;
          }
        }
        this.err = 0;
        this.msg = "";
        this.ended = false;
        this.chunks = [];
        this.strm = new ZStream();
        this.strm.avail_out = 0;
        let status = zlib_inflate.inflateInit2(
          this.strm,
          opt.windowBits
        );
        if (status !== Z_OK) {
          throw new Error(msg[status]);
        }
        this.header = new GZheader();
        zlib_inflate.inflateGetHeader(this.strm, this.header);
        if (opt.dictionary) {
          if (typeof opt.dictionary === "string") {
            opt.dictionary = strings.string2buf(opt.dictionary);
          } else if (toString.call(opt.dictionary) === "[object ArrayBuffer]") {
            opt.dictionary = new Uint8Array(opt.dictionary);
          }
          if (opt.raw) {
            status = zlib_inflate.inflateSetDictionary(this.strm, opt.dictionary);
            if (status !== Z_OK) {
              throw new Error(msg[status]);
            }
          }
        }
      }
      Inflate.prototype.push = function(data, flush_mode) {
        const strm = this.strm;
        const chunkSize = this.options.chunkSize;
        const dictionary = this.options.dictionary;
        let status, _flush_mode, last_avail_out;
        if (this.ended) return false;
        if (flush_mode === ~~flush_mode) _flush_mode = flush_mode;
        else _flush_mode = flush_mode === true ? Z_FINISH : Z_NO_FLUSH;
        if (toString.call(data) === "[object ArrayBuffer]") {
          strm.input = new Uint8Array(data);
        } else {
          strm.input = data;
        }
        strm.next_in = 0;
        strm.avail_in = strm.input.length;
        for (; ; ) {
          if (strm.avail_out === 0) {
            strm.output = new Uint8Array(chunkSize);
            strm.next_out = 0;
            strm.avail_out = chunkSize;
          }
          status = zlib_inflate.inflate(strm, _flush_mode);
          if (status === Z_NEED_DICT && dictionary) {
            status = zlib_inflate.inflateSetDictionary(strm, dictionary);
            if (status === Z_OK) {
              status = zlib_inflate.inflate(strm, _flush_mode);
            } else if (status === Z_DATA_ERROR) {
              status = Z_NEED_DICT;
            }
          }
          while (strm.avail_in > 0 && status === Z_STREAM_END && strm.state.wrap > 0 && data[strm.next_in] !== 0) {
            zlib_inflate.inflateReset(strm);
            status = zlib_inflate.inflate(strm, _flush_mode);
          }
          switch (status) {
            case Z_STREAM_ERROR:
            case Z_DATA_ERROR:
            case Z_NEED_DICT:
            case Z_MEM_ERROR:
              this.onEnd(status);
              this.ended = true;
              return false;
          }
          last_avail_out = strm.avail_out;
          if (strm.next_out) {
            if (strm.avail_out === 0 || status === Z_STREAM_END) {
              if (this.options.to === "string") {
                let next_out_utf8 = strings.utf8border(strm.output, strm.next_out);
                let tail = strm.next_out - next_out_utf8;
                let utf8str = strings.buf2string(strm.output, next_out_utf8);
                strm.next_out = tail;
                strm.avail_out = chunkSize - tail;
                if (tail) strm.output.set(strm.output.subarray(next_out_utf8, next_out_utf8 + tail), 0);
                this.onData(utf8str);
              } else {
                this.onData(strm.output.length === strm.next_out ? strm.output : strm.output.subarray(0, strm.next_out));
              }
            }
          }
          if (status === Z_OK && last_avail_out === 0) continue;
          if (status === Z_STREAM_END) {
            status = zlib_inflate.inflateEnd(this.strm);
            this.onEnd(status);
            this.ended = true;
            return true;
          }
          if (strm.avail_in === 0) break;
        }
        return true;
      };
      Inflate.prototype.onData = function(chunk) {
        this.chunks.push(chunk);
      };
      Inflate.prototype.onEnd = function(status) {
        if (status === Z_OK) {
          if (this.options.to === "string") {
            this.result = this.chunks.join("");
          } else {
            this.result = utils.flattenChunks(this.chunks);
          }
        }
        this.chunks = [];
        this.err = status;
        this.msg = this.strm.msg;
      };
      function inflate(input, options) {
        const inflator = new Inflate(options);
        inflator.push(input);
        if (inflator.err) throw inflator.msg || msg[inflator.err];
        return inflator.result;
      }
      function inflateRaw(input, options) {
        options = options || {};
        options.raw = true;
        return inflate(input, options);
      }
      module.exports.Inflate = Inflate;
      module.exports.inflate = inflate;
      module.exports.inflateRaw = inflateRaw;
      module.exports.ungzip = inflate;
      module.exports.constants = require_constants();
    }
  });

  // tools/node_modules/pako/index.js
  var require_pako = __commonJS({
    "tools/node_modules/pako/index.js"(exports, module) {
      "use strict";
      var { Deflate, deflate, deflateRaw, gzip } = require_deflate2();
      var { Inflate, inflate, inflateRaw, ungzip } = require_inflate2();
      var constants = require_constants();
      module.exports.Deflate = Deflate;
      module.exports.deflate = deflate;
      module.exports.deflateRaw = deflateRaw;
      module.exports.gzip = gzip;
      module.exports.Inflate = Inflate;
      module.exports.inflate = inflate;
      module.exports.inflateRaw = inflateRaw;
      module.exports.ungzip = ungzip;
      module.exports.constants = constants;
    }
  });

  // ../src_private/plugins/qq-source.plugin.v1.9.26.js
  var require_qq_source_plugin_v1_9_26 = __commonJS({
    "../src_private/plugins/qq-source.plugin.v1.9.26.js"(exports, module) {
      var axios = require_axios_shim();
      var SOURCE_TIMEOUT = 4500;
      var RESOLVE_BUDGET_MS = 8e3;
      var RELAY_TIMEOUT = 2500;
      var CHAIN_DEADLINE = 0;
      var CHAIN_TOKEN = 0;
      function chainSegTimeout(own) {
        if (!CHAIN_DEADLINE) return own;
        var r = CHAIN_DEADLINE - Date.now();
        if (r <= 300) return 300;
        return Math.min(own, r);
      }
      var DURATION_TOLERANCE_SEC = 6;
      function str(v) {
        return v === void 0 || v === null ? "" : String(v);
      }
      function qqFeeOf(pay) {
        if (!pay) return 0;
        if (parseInt(pay.pay_play, 10) === 1 || parseInt(pay.pay_month, 10) === 1 || parseInt(pay.pay_down, 10) === 1 || parseInt(pay.payplay, 10) === 1 || parseInt(pay.paymonth, 10) === 1 || parseInt(pay.paydownload, 10) === 1) return 1;
        return 0;
      }
      function splitArtists(list) {
        if (!list || !list.length) return "";
        var names = [];
        for (var i = 0; i < list.length; i++) {
          var n = list[i] && list[i].name;
          if (n) names.push(String(n));
        }
        return names.join(", ");
      }
      function normalizeTitle(raw) {
        if (!raw) return "";
        return String(raw).toLowerCase().replace(/\s+/g, "").replace(/（[^）]*）/g, "").replace(/\([^)]*\)/g, "").replace(/【[^】]*】/g, "").replace(/\[[^\]]*\]/g, "").replace(/[·・~～_]/g, "").trim();
      }
      function normalizeArtist(raw) {
        if (!raw) return "";
        return String(raw).toLowerCase().split(/\s*(?:[、，,/&]|\bfeaturing\b|\bfeat\.?|\bft\.?)\s*/i)[0].replace(/\s+/g, "").trim();
      }
      function makeKey(title, artist) {
        return normalizeTitle(title) + "|" + normalizeArtist(artist);
      }
      var VERSION_WORD_RE = /\b(?:live|remix|piano|acoustic|covers?|dj|instrumental)\b|现场|混音|改编|钢琴|对唱|合唱|翻唱|伴奏|纯音乐/gi;
      function looseTitleKey(rawTitle) {
        return normalizeTitle(String(rawTitle || "").replace(VERSION_WORD_RE, ""));
      }
      var FEAT_TAIL_RE = /\s*(?:\bfeaturing\b|\bfeat\.?|\bft\.?).*$/i;
      var VERSION_HINTS = [
        { re: /\blive\b|现场/i, tag: "live" },
        { re: /\bremix\b|混音|改编/i, tag: "remix" },
        { re: /\bpiano\b|钢琴/i, tag: "piano" },
        { re: /\bacoustic\b/i, tag: "acoustic" },
        { re: /对唱|合唱/i, tag: "duet" },
        { re: /\bcovers?\b|翻唱/i, tag: "cover" },
        { re: /伴奏|\binstrumental\b|纯音乐/i, tag: "instrumental" }
      ];
      var PACKAGING_HINT_RE = /主题曲|片头曲|片尾曲|插曲|推广曲|概念曲|宣传曲|\bOST\b|\bsoundtrack\b/i;
      var MEDIA_HINT_RE = /hi-?res|无损|高品质|\bsq\b|\bflac\b|4K|1080P|高清|3D环绕|立体|8D|重低音/i;
      function detectDj(title) {
        var brackets = String(title).match(/（[^）]*）|\([^)]*\)|【[^】]*】|\[[^\]]*\]/g) || [];
        for (var i = 0; i < brackets.length; i++) {
          if (/\bdj\b/i.test(brackets[i])) return true;
        }
        var tail = (String(title).split(/\s*[-—–|｜]\s*/).pop() || "").trim();
        return /\bdj(版|version)?\s*$/i.test(tail);
      }
      function parseVersionTags(rawTitle) {
        var title = String(rawTitle || "").replace(FEAT_TAIL_RE, "");
        var versions = [];
        for (var i = 0; i < VERSION_HINTS.length; i++) {
          if (VERSION_HINTS[i].re.test(title)) versions.push(VERSION_HINTS[i].tag);
        }
        if (detectDj(title)) versions.push("dj");
        var pm = title.match(PACKAGING_HINT_RE);
        var mm = title.match(MEDIA_HINT_RE);
        return {
          versions,
          packaging: pm ? [pm[0]] : [],
          media: mm ? [mm[0]] : []
        };
      }
      function versionCompatible(a, b) {
        var av = a.versions.slice().sort();
        var bv = b.versions.slice().sort();
        var seenA = {}, ua = [], seenB = {}, ub = [], i;
        for (i = 0; i < av.length; i++) {
          if (!seenA[av[i]]) {
            seenA[av[i]] = 1;
            ua.push(av[i]);
          }
        }
        for (i = 0; i < bv.length; i++) {
          if (!seenB[bv[i]]) {
            seenB[bv[i]] = 1;
            ub.push(bv[i]);
          }
        }
        if (ua.length === 0 && ub.length === 0) return true;
        if (ua.length === 0 || ub.length === 0) return false;
        if (ua.length !== ub.length) return false;
        for (i = 0; i < ua.length; i++) {
          if (ua[i] !== ub[i]) return false;
        }
        return true;
      }
      var TAG_TIER = {
        live: 0.85,
        remix: 0.85,
        piano: 0.85,
        acoustic: 0.85,
        duet: 0.85,
        dj: 0.4,
        cover: 0.4,
        instrumental: 0.3
      };
      function versionTier(parse) {
        var tier = 1;
        for (var i = 0; i < parse.versions.length; i++) {
          var t = TAG_TIER[parse.versions[i]];
          if (t !== void 0 && t < tier) tier = t;
        }
        return tier;
      }
      function isSameSong(a, b) {
        if (normalizeTitle(a.title) !== normalizeTitle(b.title)) {
          if (looseTitleKey(a.title) !== looseTitleKey(b.title)) return false;
        }
        if (normalizeArtist(a.artist) !== normalizeArtist(b.artist)) return false;
        if (!versionCompatible(parseVersionTags(a.title), parseVersionTags(b.title))) return false;
        if (a.duration && b.duration) {
          return Math.abs(a.duration - b.duration) <= DURATION_TOLERANCE_SEC;
        }
        if (a.source && a.sid && a.source === b.source && a.sid === b.sid) return true;
        if (a.duration || b.duration) {
          return !!a.album && !!b.album && normalizeTitle(a.album) === normalizeTitle(b.album);
        }
        return false;
      }
      var SOURCE_WEIGHT = {
        qq: 0.85
      };
      var SOURCE_QUALITIES = {
        // [v1.9.23] hires/master 升为独立内部档（实测真通道存在，见 resolveQq 高档专属链）
        qq: ["standard", "high", "super", "hires", "master"]
      };
      function canServe(source, quality) {
        var caps = SOURCE_QUALITIES[source] || [];
        return caps.indexOf(quality) >= 0;
      }
      function searchQq(query, page) {
        var body = {
          comm: { ct: "24", cv: "0" },
          req: {
            module: "music.adaptor.SearchAdaptor",
            method: "do_search_v2",
            param: {
              query,
              search_type: 0,
              page_num: page,
              num_per_page: 20
            }
          }
        };
        return axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", body, {
          timeout: SOURCE_TIMEOUT,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            Referer: "https://y.qq.com/",
            "Content-Type": "application/json"
          }
        }).then(function(res) {
          var reqData = res.data && res.data.req && res.data.req.data;
          var bodyData = reqData && reqData.body;
          var group = bodyData && bodyData.item_song || {};
          var list = group && group.items || [];
          var out = list.map(function(it) {
            var albumMid = it.album && it.album.mid ? String(it.album.mid) : "";
            return {
              source: "qq",
              sid: str(it.mid),
              title: str(it.name),
              artist: splitArtists(it.singer),
              album: it.album && it.album.name ? String(it.album.name) : "",
              duration: parseInt(it.interval, 10) || 0,
              artwork: albumMid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + albumMid + ".jpg" : "",
              raw: { mid: str(it.mid), mediaMid: it.file && it.file.media_mid ? String(it.file.media_mid) : "", vid: it.mv && it.mv.vid ? String(it.mv.vid) : "", vip: qqFeeOf(it.pay) },
              qualities: parseQqFileQualities(it.file)
              // [v1.3.0 P0-1] 搜索条目带音质表（宿主 qualities[].size）
            };
          }).filter(function(it) {
            return it.sid && it.title;
          });
          out.total = parseInt(group.total_num, 10) || parseInt(group.estimate_sum, 10) || 0;
          if (!out.length) return searchQqSoso(query, page);
          return out;
        }).catch(function(e) {
          return searchQqSoso(query, page).catch(function() {
            throw e;
          });
        });
      }
      var QQ_SOSO_REFERER = "https://y.qq.com/portal/search.html";
      function searchQqSoso(query, page) {
        var p = page || 1;
        return axios.get("https://c.y.qq.com/soso/fcgi-bin/search_for_qq_cp", {
          timeout: SOURCE_TIMEOUT,
          params: { format: "json", n: 20, p, w: query },
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            Referer: QQ_SOSO_REFERER
          }
        }).then(function(res) {
          var d = res.data;
          if (typeof d === "string") {
            try {
              d = JSON.parse(d);
            } catch (e) {
              d = null;
            }
          }
          var songGrp = d && d.data && d.data.song || {};
          var list = songGrp.list || [];
          var out = list.map(function(s) {
            var albumMid = s.albummid ? String(s.albummid) : "";
            var singers = Array.isArray(s.singer) ? s.singer : [];
            return {
              source: "qq",
              sid: str(s.songmid),
              title: str(s.songname),
              artist: singers.map(function(x) {
                return str(x && x.name);
              }).filter(Boolean).join("/"),
              album: s.albumname ? String(s.albumname) : "",
              duration: parseInt(s.interval, 10) || 0,
              artwork: albumMid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + albumMid + ".jpg" : "",
              raw: { mid: str(s.songmid), mediaMid: s.media_mid ? String(s.media_mid) : "", vid: "", vip: qqFeeOf(s.pay) }
            };
          }).filter(function(it) {
            return it.sid && it.title;
          });
          out.total = parseInt(songGrp.totalnum, 10) || 0;
          return out;
        });
      }
      async function searchLyricQq(q, page) {
        var p = page || 1;
        var res = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
          req: {
            module: "music.search.SearchCgiService",
            method: "DoSearchForQQMusicDesktop",
            param: { query: q, search_type: 7, page_num: p, num_per_page: 30 }
          }
          // [v1.8.1 P1-2] 携带用户配置 qqCookie（v1.7.1 未带 Cookie 风控静默空）
        }, { timeout: SOURCE_TIMEOUT, headers: qqCookieHeaders(QQ_SEARCH_HEADERS) });
        var reqData = res.data && res.data.req && res.data.req.data;
        var _reqcode = res.data && res.data.req && res.data.req.code;
        if (_reqcode !== void 0 && _reqcode !== 0) {
          throw new Error("QQ \u6B4C\u8BCD\u641C\u7D22 reqcode=" + _reqcode + "\uFF08\u7591\u4F3C\u98CE\u63A7/\u7F3A\u767B\u5F55\u6001\uFF09");
        }
        var _body = reqData && reqData.body;
        var _songList = _body && _body.song && _body.song.list || [];
        var _lyricList = _body && _body.lyric && _body.lyric.list || [];
        if (_songList.length === 0 && _lyricList.length === 0) {
          throw new Error("QQ \u6B4C\u8BCD\u641C\u7D22\u5168\u7EC4\u4E3A\u7A7A reqcode=" + _reqcode + "\uFF08\u7591\u4F3C\u98CE\u63A7/\u7F3A\u767B\u5F55\u6001\uFF0C\u8BF7\u914D\u7F6E qqCookie\uFF09");
        }
        var lyricGrp = reqData && reqData.body && (reqData.body.song || reqData.body.lyric) || {};
        var list = lyricGrp.list || [];
        var sum = parseInt(lyricGrp.sum, 10) || 0;
        var data = [];
        for (var i = 0; i < list.length; i++) {
          var it = list[i];
          if (!it || !it.mid || !it.content) continue;
          var albumMid = it.album && it.album.mid ? String(it.album.mid) : it.albummid ? String(it.albummid) : "";
          var item = buildSheetItem({
            source: "qq",
            sid: str(it.mid),
            title: str(it.name || it.songname),
            artist: splitArtists(it.singer),
            album: it.album && it.album.name ? String(it.album.name) : it.albumname ? String(it.albumname) : "",
            duration: parseInt(it.interval, 10) || 0,
            artwork: albumMid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + albumMid + ".jpg" : "",
            raw: { mid: str(it.mid), mediaMid: it.file && it.file.media_mid ? String(it.file.media_mid) : "", vid: it.mv && it.mv.vid ? String(it.mv.vid) : "", vip: qqFeeOf(it.pay) },
            qualities: parseQqFileQualities(it.file)
            // [v1.3.0 P0-1] 歌词搜索条目带音质表
          });
          item.rawLrcTxt = str(it.content);
          data.push(item);
        }
        return { isEnd: sum > 0 ? p * 30 >= sum : list.length < 30, data };
      }
      var SEARCH_ADAPTERS = {
        qq: searchQq
      };
      function scoreOf(item, hitSources) {
        var tier = versionTier(parseVersionTags(item.title));
        var w = SOURCE_WEIGHT[item.source] || 0.5;
        return tier * w * (1 + 0.15 * (hitSources - 1));
      }
      function aggregateItems(items) {
        var groups = [];
        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var merged = false;
          for (var g = 0; g < groups.length && !merged; g++) {
            var members = groups[g].members;
            for (var m = 0; m < members.length; m++) {
              if (isSameSong(members[m], it)) {
                members.push(it);
                merged = true;
                break;
              }
            }
          }
          if (!merged) groups.push({ members: [it] });
        }
        return groups;
      }
      function buildMusicItem(group) {
        var members = group.members;
        var best = members[0];
        var bestScore = -1;
        for (var i = 0; i < members.length; i++) {
          var s = scoreOf(members[i], members.length);
          if (s > bestScore || s === bestScore && members[i].duration > 0 && best.duration === 0) {
            bestScore = s;
            best = members[i];
          }
        }
        var src = {};
        for (var j = 0; j < members.length; j++) {
          var mm = members[j];
          if (!src[mm.source]) src[mm.source] = mm.raw;
        }
        var artwork = best.artwork;
        var duration = best.duration;
        for (var k = 0; k < members.length && (!artwork || !duration); k++) {
          if (!artwork && members[k].artwork) artwork = members[k].artwork;
          if (!duration && members[k].duration) duration = members[k].duration;
        }
        var srcOrder = [];
        for (var om = 0; om < members.length; om++) {
          if (srcOrder.indexOf(members[om].source) < 0) srcOrder.push(members[om].source);
        }
        var item = {
          id: best.source + "_" + best.sid,
          // v0.7.1 P1-2：稳定身份，不再拼页内序号
          // [v1.7.1 对齐] IMusicItem 标准字段 platform 自报：宿主仅在搜索/榜单/歌单等入口
          // 覆写 platform，导入/备份恢复路径不覆写，缺失时 pluginManager.getByName(mediaItem.platform)
          // 无法定位插件（对齐酷我 v1.2.8 同款修复）
          platform: "qq",
          title: best.title,
          artist: best.artist,
          album: best.album,
          artwork: artwork || void 0,
          duration: duration || void 0,
          _src: src,
          _srcOrder: srcOrder
        };
        if (src.qq && src.qq.vid) {
          item.videoId = String(src.qq.vid);
          item.mv = String(src.qq.vid);
          item.mvId = String(src.qq.vid);
          item.mvVid = String(src.qq.vid);
        }
        if (src.qq && src.qq.mid) item.songmid = String(src.qq.mid);
        var quals = best.qualities;
        for (var qi = 0; qi < members.length && !quals; qi++) {
          if (members[qi].qualities) quals = members[qi].qualities;
        }
        if (quals) item.qualities = quals;
        if (src.qq && src.qq.mid) item.primaryKey = String(src.qq.mid);
        return item;
      }
      var CHART_TTL_MS = 30 * 60 * 1e3;
      var chartCache = {};
      var chartInflight = {};
      var CHART_DEFS = [
        {
          id: "agg-hot",
          title: "\u70ED\u6B4C\u699C",
          cover: "https://p3-luna.douyinpic.com/img/tos-cn-i-b829550vbb/d0d8d48461a62748e84689cdf049b19a.png~tplv-b829550vbb-resize:960:960.png",
          members: [
            { source: "qq", id: "26" }
          ]
        },
        {
          id: "agg-new",
          title: "\u65B0\u6B4C\u699C",
          cover: "",
          members: [
            { source: "qq", id: "27" }
          ]
        },
        {
          id: "agg-west",
          title: "\u6B27\u7F8E\u699C",
          cover: "",
          members: [
            { source: "qq", id: "61" }
          ]
        }
      ];
      var CHART_FETCHERS = {
        qq: function(topId, offset) {
          return axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
            comm: { ct: "24", cv: "0" },
            req: {
              module: "musicToplist.ToplistInfoServer",
              method: "GetDetail",
              param: { topId: parseInt(topId, 10), offset: parseInt(offset, 10) || 0, num: 100, period: "" }
            }
          }, {
            timeout: SOURCE_TIMEOUT,
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
              Referer: "https://y.qq.com/",
              "Content-Type": "application/json"
            }
          }).then(function(res) {
            var reqData = res.data && res.data.req && res.data.req.data;
            var list = reqData && reqData.songInfoList || [];
            return list.map(function(it) {
              var albumMid = it.album && it.album.mid ? String(it.album.mid) : "";
              return {
                source: "qq",
                sid: str(it.mid),
                title: str(it.name),
                artist: splitArtists(it.singer),
                album: it.album && it.album.name ? String(it.album.name) : "",
                duration: parseInt(it.interval, 10) || 0,
                artwork: albumMid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + albumMid + ".jpg" : "",
                raw: { mid: str(it.mid), mediaMid: it.file && it.file.media_mid ? String(it.file.media_mid) : "", vid: it.mv && it.mv.vid ? String(it.mv.vid) : "", vip: qqFeeOf(it.pay) },
                qualities: parseQqFileQualities(it.file)
                // [v1.3.0 P0-1] 榜单条目带音质表
              };
            }).filter(function(it) {
              return it.sid && it.title;
            });
          });
        }
      };
      function mergeChartLists(lists) {
        var entries = [];
        var byKey = {};
        var byLoose = {};
        for (var li = 0; li < lists.length; li++) {
          var src = lists[li].source;
          var items = lists[li].items || [];
          var n = items.length;
          if (!n) continue;
          for (var ii = 0; ii < n; ii++) {
            var it = items[ii];
            var rankScore = (n - ii) / n;
            var skey = makeKey(it.title, it.artist);
            var lkey = looseTitleKey(it.title);
            var entry = byKey[skey];
            if (!entry) {
              var cands = byLoose[lkey] || [];
              for (var ci = 0; ci < cands.length; ci++) {
                if (isSameSong(entries[cands[ci]].hits[0].item, it)) {
                  entry = entries[cands[ci]];
                  break;
                }
              }
            }
            if (!entry) {
              entry = { key: skey, hits: [{ source: src, item: it, rankScore }] };
              entries.push(entry);
              byKey[skey] = entry;
              if (!byLoose[lkey]) byLoose[lkey] = [];
              byLoose[lkey].push(entries.length - 1);
            } else {
              var dup = null;
              for (var hi = 0; hi < entry.hits.length; hi++) {
                if (entry.hits[hi].source === src) {
                  dup = entry.hits[hi];
                  break;
                }
              }
              if (dup) {
                if (rankScore > dup.rankScore) {
                  dup.rankScore = rankScore;
                  dup.item = it;
                }
              } else {
                entry.hits.push({ source: src, item: it, rankScore });
              }
            }
          }
        }
        for (var e = 0; e < entries.length; e++) {
          var en = entries[e];
          var sum = 0;
          for (var h = 0; h < en.hits.length; h++) sum += en.hits[h].rankScore;
          en.score = sum / en.hits.length + 0.2 * (en.hits.length - 1);
        }
        return entries;
      }
      function buildChartItem(entry) {
        var base = entry.hits[0];
        for (var i = 1; i < entry.hits.length; i++) {
          var w1 = SOURCE_WEIGHT[entry.hits[i].source] || 0.5;
          var w0 = SOURCE_WEIGHT[base.source] || 0.5;
          if (w1 > w0 || w1 === w0 && entry.hits[i].rankScore > base.rankScore) base = entry.hits[i];
        }
        var duration = parseInt(base.item.duration, 10) || 0;
        for (var j = 0; j < entry.hits.length && !duration; j++) {
          duration = parseInt(entry.hits[j].item.duration, 10) || 0;
        }
        var src = {};
        for (var k = 0; k < entry.hits.length; k++) {
          if (entry.hits[k].item.raw && !src[entry.hits[k].source]) {
            src[entry.hits[k].source] = entry.hits[k].item.raw;
          }
        }
        var aggQuals = base.item.qualities;
        for (var aq = 0; aq < entry.hits.length && !aggQuals; aq++) {
          if (entry.hits[aq].item.qualities) aggQuals = entry.hits[aq].item.qualities;
        }
        return {
          id: "c_" + base.source + "_" + base.item.sid,
          // [v1.7.1 qa#1 P1] 榜单歌曲条目补 IMusicItem 标准字段 platform 自报：宿主按
          // media.platform 路由取链（pluginManager.getByName），缺失时榜单点击播放直接失败
          platform: "qq",
          title: base.item.title,
          artist: base.item.artist,
          album: base.item.album || void 0,
          duration: duration || void 0,
          artwork: base.item.artwork || void 0,
          qualities: aggQuals || void 0,
          _src: src
        };
      }
      function fetchChartMember(member) {
        var fn = CHART_FETCHERS[member.source];
        if (!fn) return Promise.resolve({ source: member.source, items: [] });
        return fn(member.id).then(function(items) {
          return { source: member.source, items };
        }).catch(function() {
          return { source: member.source, items: [] };
        });
      }
      function findChartDef(id) {
        for (var i = 0; i < CHART_DEFS.length; i++) {
          if (CHART_DEFS[i].id === id) return CHART_DEFS[i];
        }
        return null;
      }
      function getAggregatedChart(def) {
        var cached = chartCache[def.id];
        if (cached && Date.now() - cached.ts < CHART_TTL_MS) {
          return Promise.resolve(cached.list);
        }
        if (chartInflight[def.id]) return chartInflight[def.id];
        var p = Promise.all(def.members.map(fetchChartMember)).then(function(lists) {
          var ok = 0;
          for (var i = 0; i < lists.length; i++) {
            if (lists[i].items.length > 0) ok++;
          }
          if (ok === 0) throw new Error("\u805A\u5408\u699C\u5355\u62C9\u53D6\u5931\u8D25\uFF1A\u6240\u6709\u5E73\u53F0\u699C\u5355\u8BF7\u6C42\u5747\u5931\u8D25");
          var merged = mergeChartLists(lists);
          merged.sort(function(a, b) {
            if (b.score !== a.score) return b.score - a.score;
            return a.hits[0].rankScore - b.hits[0].rankScore;
          });
          var musicList = [];
          var cap = Math.min(merged.length, 100);
          for (var j = 0; j < cap; j++) musicList.push(buildChartItem(merged[j]));
          chartCache[def.id] = { ts: Date.now(), list: musicList };
          return musicList;
        });
        var p2 = p.then(
          function(r) {
            delete chartInflight[def.id];
            return r;
          },
          function(e) {
            delete chartInflight[def.id];
            throw e;
          }
        );
        chartInflight[def.id] = p2;
        return p2;
      }
      var SHEET_MAX_PAGES = 5;
      var SHEET_MAX_ITEMS = 500;
      var SHEET_URL_RESOLVERS = {
        qq: function(s) {
          if (!/qq\.com/.test(s)) return null;
          var m = /\/playlist\/(\d+)/.exec(s) || /\/playlistDetail\/(\d+)/.exec(s) || /[?&]disstid=(\d+)/.exec(s) || /[?&]id=(\d+)/.exec(s);
          return m ? m[1] : null;
        }
      };
      function sheetImportError(code, msg) {
        var e = new Error("[qq] " + msg);
        e.code = code;
        e.platform = "qq";
        return e;
      }
      function extractShareUrl(text) {
        var m = /https?:\/\/[^\s<>"']+/.exec(String(text || ""));
        if (!m) return "";
        var u = m[0];
        var cut = u.search(/[\u3000-\u303f\u4e00-\u9fff\uff00-\uffef]/);
        if (cut > 8) u = u.slice(0, cut);
        return u.replace(/[.,;!?\u3002\uff0c\uff1b\uff1a\uff01\uff1f\u2026]+$/, "");
      }
      async function resolveSheetId(urlLike) {
        var s = String(urlLike || "").trim();
        if (!s) throw sheetImportError("SHEET_URL_EMPTY", "\u6B4C\u5355\u94FE\u63A5\u4E3A\u7A7A");
        var extractedUrl = extractShareUrl(s);
        if (extractedUrl) s = extractedUrl;
        if (/^\d{4,}$/.test(s)) return { source: "qq", id: s };
        var id = SHEET_URL_RESOLVERS.qq(s);
        if (id) return { source: "qq", id };
        throw sheetImportError("SHEET_URL_UNRECOGNIZED", "\u65E0\u6CD5\u8BC6\u522B\u7684\u6B4C\u5355\u94FE\u63A5\uFF08\u652F\u6301 QQ \u97F3\u4E50\u7684\u6B4C\u5355\u7F51\u9875/\u5206\u4EAB\u94FE\u63A5/\u7EAF\u6570\u5B57\u6B4C\u5355 ID\uFF09");
      }
      async function fetchQqToplistGroups() {
        var r = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
          comm: { ct: "24", cv: "0" },
          req: {
            module: "musicToplist.ToplistInfoServer",
            method: "GetAll",
            param: {}
          }
        }, { timeout: SOURCE_TIMEOUT, headers: QQ_SEARCH_HEADERS });
        var gs = r.data && r.data.req && r.data.req.data && r.data.req.data.group;
        if (!gs || !gs.length) throw new Error("qq toplist GetAll no group");
        var out = [];
        for (var i = 0; i < gs.length; i++) {
          var g = gs[i] || {};
          var data = (g.toplist || []).map(function(t) {
            var tCover = t && (t.headPicUrl || t.frontPicUrl) ? String(t.headPicUrl || t.frontPicUrl).replace(/^http:/i, "https:") : "";
            return {
              id: "qqtop~" + (t && t.topId),
              // [v1.7.1 qa#2 P2] 榜单卡片补 IMusicSheetItem 标准字段 platform（同批 platform 对齐）
              platform: "qq",
              title: t && t.title ? String(t.title) : "",
              coverImg: tCover,
              artwork: tCover,
              description: t && (t.titleDetail || t.intro) ? String(t.titleDetail || t.intro) : void 0
            };
          }).filter(function(t) {
            return t.id && t.title;
          });
          if (data.length) out.push({ title: str(g.groupName) || "QQ\u5B98\u65B9\u699C\u5355", data });
        }
        return out;
      }
      var SHEET_FETCHERS = {
        qq: async function(disstid) {
          var out = [];
          var dirTotal = 0;
          var sheetMeta = null;
          for (var begin = 0; begin < SHEET_MAX_ITEMS && begin / 100 < SHEET_MAX_PAGES; begin += 100) {
            var res = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
              comm: { ct: "24", cv: "0" },
              req: {
                module: "music.srfDissInfo.DissInfo",
                method: "CgiGetDiss",
                param: { disstid: parseInt(disstid, 10), dirid: 0, tag: false, song_begin: begin, song_num: 100, userinfo: false, orderlist: false, onlysonglist: true }
              }
            }, { timeout: SOURCE_TIMEOUT, headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", Referer: "https://y.qq.com/" } });
            var reqData = res.data && res.data.req && res.data.req.data;
            if (!dirTotal) dirTotal = parseInt(reqData && reqData.dirinfo && reqData.dirinfo.songnum, 10) || 0;
            if (!sheetMeta && reqData && reqData.dirinfo) {
              var di0 = reqData.dirinfo;
              sheetMeta = {
                title: str(di0.title),
                artwork: str(di0.picurl) || void 0,
                description: str(di0.desc) || void 0,
                worksNum: parseInt(di0.songnum, 10) || void 0
              };
            }
            var list = reqData && reqData.songlist || [];
            for (var i = 0; i < list.length; i++) {
              var it = list[i];
              out.push({
                source: "qq",
                sid: str(it.mid),
                title: str(it.name || it.title),
                artist: splitArtists(it.singer),
                album: it.album && it.album.name ? String(it.album.name) : "",
                duration: parseInt(it.interval, 10) || 0,
                artwork: it.album && it.album.mid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + it.album.mid + ".jpg" : "",
                raw: { mid: str(it.mid), mediaMid: it.file && it.file.media_mid ? String(it.file.media_mid) : "", vid: it.mv && it.mv.vid ? String(it.mv.vid) : "", vip: qqFeeOf(it.pay) },
                qualities: parseQqFileQualities(it.file)
                // [v1.3.0 P0-1] 歌单条目带音质表
              });
            }
            if (list.length < 100) break;
          }
          var filtered = out.filter(function(it2) {
            return it2.sid && it2.title;
          });
          filtered.total = dirTotal;
          filtered.meta = sheetMeta;
          return filtered;
        }
      };
      function parseQqFileQualities(file) {
        if (!file) return void 0;
        var out = {};
        var q128 = parseInt(file.size_128mp3, 10) || 0;
        var q320 = parseInt(file.size_320mp3, 10) || 0;
        var qflac = parseInt(file.size_flac, 10) || 0;
        if (q128 > 0) out["128k"] = { size: q128 };
        if (q320 > 0) out["320k"] = { size: q320 };
        if (qflac > 0) out["flac"] = { size: qflac };
        var qmaster = file.size_new && parseInt(file.size_new[0], 10) || 0;
        var qhires = parseInt(file.size_hires, 10) || 0;
        if (qmaster > 0) out["master"] = { size: qmaster };
        if (qhires > 0) out["hires"] = { size: qhires };
        return Object.keys(out).length ? out : void 0;
      }
      function fetchQqTrackInfoSizes(mids) {
        var all = [];
        for (var u = 0; u < (mids || []).length; u++) {
          var m = mids[u] && String(mids[u]);
          if (m && all.indexOf(m) < 0) all.push(m);
        }
        if (!all.length) return Promise.resolve({});
        var CHUNK = 100;
        var chunks = [];
        for (var c = 0; c < all.length; c += CHUNK) chunks.push(all.slice(c, c + CHUNK));
        var out = {};
        return chunks.reduce(function(chain, chunk) {
          return chain.then(function() {
            return axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
              comm: { ct: 19, cv: 1859, uin: 0 },
              req: {
                module: "music.trackInfo.UniformRuleCtrl",
                method: "CgiGetTrackInfo",
                param: { types: chunk.map(function() {
                  return 0;
                }), ids: chunk.map(function() {
                  return 0;
                }), mids: chunk, ctx: 0 }
              }
            }, { timeout: SOURCE_TIMEOUT, headers: { Referer: "https://y.qq.com/", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }).then(function(res) {
              var tracks = res.data && res.data.req && res.data.req.data && res.data.req.data.tracks;
              if (Array.isArray(tracks)) {
                for (var i = 0; i < tracks.length; i++) {
                  var t = tracks[i];
                  var mid = t && t.mid ? String(t.mid) : "";
                  if (!mid) continue;
                  var q = parseQqFileQualities(t.file);
                  if (q) out[mid] = q;
                }
              }
            }).catch(function() {
            });
          });
        }, Promise.resolve()).then(function() {
          return out;
        });
      }
      function buildSheetItem(entry) {
        var src = {};
        src[entry.source] = entry.raw;
        var item = {
          id: entry.source + "_" + entry.sid,
          // [v1.7.1 对齐] IMusicSheetItem 标准字段 platform 自报（同 buildMusicItem 口径）
          platform: "qq",
          title: entry.title,
          artist: entry.artist,
          album: entry.album || void 0,
          duration: entry.duration || void 0,
          artwork: entry.artwork || void 0,
          _src: src,
          _srcOrder: [entry.source]
        };
        if (entry.qualities) {
          item.qualities = entry.qualities;
        }
        if (src.qq && src.qq.vid) {
          item.videoId = String(src.qq.vid);
          item.mv = String(src.qq.vid);
          item.mvId = String(src.qq.vid);
          item.mvVid = String(src.qq.vid);
        }
        if (src.qq && src.qq.mid) {
          item.songmid = String(src.qq.mid);
          item.primaryKey = String(src.qq.mid);
        }
        return item;
      }
      async function importMusicSheetImpl(urlLike) {
        var resolved = await resolveSheetId(urlLike);
        var fetcher = SHEET_FETCHERS[resolved.source];
        if (!fetcher) throw sheetImportError("SHEET_URL_UNRECOGNIZED", "\u8BE5\u5E73\u53F0\u6682\u4E0D\u652F\u6301\u6B4C\u5355\u5BFC\u5165");
        var entries;
        try {
          entries = await fetcher(resolved.id);
        } catch (e) {
          throw sheetImportError("SHEET_FETCH_FAILED", "\u6B4C\u5355\u6B4C\u66F2\u62C9\u53D6\u5931\u8D25\uFF1A" + (e && e.message || e));
        }
        if (!entries.length) throw sheetImportError("SHEET_EMPTY", "\u6B4C\u5355\u4E3A\u7A7A\u6216\u62C9\u53D6\u5931\u8D25\uFF08" + resolved.source + " #" + resolved.id + "\uFF09");
        var seen = {};
        var out = [];
        for (var i = 0; i < entries.length && out.length < SHEET_MAX_ITEMS; i++) {
          var key = entries[i].sid;
          if (seen[key]) continue;
          seen[key] = 1;
          out.push(buildSheetItem(entries[i]));
        }
        var meta = entries.meta || null;
        var sheet = {
          id: "qq_" + resolved.id,
          platform: "qq",
          isImported: true,
          title: meta && meta.title || "QQ\u6B4C\u5355 #" + resolved.id,
          artwork: meta && meta.artwork || out[0] && out[0].artwork || void 0,
          worksNum: meta && meta.worksNum || entries.total || out.length,
          musicList: out
        };
        if (meta && meta.description) sheet.description = meta.description;
        if (meta && meta.artist) {
          sheet.artist = meta.artist;
          sheet.author = meta.artist;
        }
        return sheet;
      }
      var SONG_URL_RESOLVERS = {
        qq: function(s) {
          if (!/qq\.com/.test(s)) return null;
          var m = /songDetail\/([0-9A-Za-z]+)/.exec(s) || /[?&]songid=([0-9A-Za-z]+)/.exec(s);
          return m ? m[1] : null;
        }
      };
      async function resolveSongId(urlLike) {
        var s = String(urlLike || "").trim();
        if (!s) throw new Error("\u5355\u66F2\u94FE\u63A5\u4E3A\u7A7A");
        if (/^\d{5,}$/.test(s)) throw new Error("\u7EAF\u6570\u5B57\u6B4C\u66F2 id \u65E0\u6CD5\u5224\u5B9A\u5E73\u53F0\uFF0C\u8BF7\u7C98\u8D34\u5E26\u57DF\u540D\u7684\u5B8C\u6574\u5206\u4EAB\u94FE\u63A5");
        var id = SONG_URL_RESOLVERS.qq(s);
        if (id) return { source: "qq", id };
        throw new Error("\u65E0\u6CD5\u8BC6\u522B\u7684\u5355\u66F2\u94FE\u63A5\uFF08\u652F\u6301 QQ \u97F3\u4E50\u7684\u6B4C\u66F2\u5206\u4EAB\u94FE\u63A5\uFF09");
      }
      var SONG_DETAIL_FETCHERS = {
        qq: function(mid) {
          return axios.get("https://c.y.qq.com/v8/fcg-bin/fcg_play_single_song.fcg", {
            params: { songmid: mid, tp: "yqq_song_detail", format: "json" },
            timeout: SOURCE_TIMEOUT,
            headers: { Referer: "https://y.qq.com/", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
          }).then(function(res) {
            var t = res.data && res.data.data && res.data.data[0];
            if (!t) throw new Error("qq detail empty");
            var albumMid = t.album && t.album.mid ? String(t.album.mid) : "";
            return {
              source: "qq",
              sid: str(t.mid),
              title: str(t.name),
              artist: splitArtists(t.singer),
              album: t.album && t.album.name ? String(t.album.name) : "",
              duration: parseInt(t.interval, 10) || 0,
              artwork: albumMid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + albumMid + ".jpg" : "",
              raw: { mid: str(t.mid), mediaMid: t.file && t.file.media_mid ? String(t.file.media_mid) : "", vid: t.mv && t.mv.vid ? String(t.mv.vid) : "", vip: qqFeeOf(t.pay) },
              qualities: parseQqFileQualities(t.file)
              // [v1.3.0 P0-2] 详情带音质表，getMusicInfoImpl 回填
            };
          });
        }
      };
      async function importMusicItemImpl(urlLike) {
        var resolved = await resolveSongId(urlLike);
        var fetcher = SONG_DETAIL_FETCHERS[resolved.source];
        var entry = await fetcher(resolved.id);
        if (!entry || !entry.sid) throw new Error("\u5355\u66F2\u8BE6\u60C5\u62C9\u53D6\u5931\u8D25\uFF08" + resolved.source + " #" + resolved.id + "\uFF09");
        return buildSheetItem(entry);
      }
      async function getMusicInfoImpl(musicItem) {
        if (!musicItem) return musicItem;
        if (!musicItem._src) {
          try {
            var bareId = String(musicItem.songmid || musicItem.mid || musicItem.id || "").trim();
            if (bareId && SONG_DETAIL_FETCHERS.qq) {
              var entry = await SONG_DETAIL_FETCHERS.qq(bareId);
              if (entry && entry.sid) return buildSheetItem(entry);
            }
          } catch (e) {
          }
          return musicItem;
        }
        var srcMap = musicItem._src;
        var order = musicItem._srcOrder && musicItem._srcOrder.length ? musicItem._srcOrder.slice() : pickCandidates(srcMap, "standard");
        order = order.filter(function(s2) {
          return SONG_DETAIL_FETCHERS[s2] && srcMap[s2];
        });
        var sidKey = { qq: "mid" };
        for (var i = 0; i < Math.min(order.length, 2); i++) {
          var s = order[i];
          var raw = srcMap[s] || {};
          var sid = raw[sidKey[s]] || "";
          if (!sid) continue;
          try {
            var detail = await SONG_DETAIL_FETCHERS[s](sid);
            if (!detail) continue;
            if (!musicItem.artwork && detail.artwork) musicItem.artwork = detail.artwork;
            if (!musicItem.album && detail.album) musicItem.album = detail.album;
            if (!musicItem.duration && detail.duration) musicItem.duration = detail.duration;
            if (!musicItem.qualities && detail.qualities) musicItem.qualities = detail.qualities;
            if (detail.raw && detail.raw.mv && !musicItem.mv) musicItem.mv = String(detail.raw.mv);
            if (detail.raw && detail.raw.vid && !musicItem.videoId) musicItem.videoId = String(detail.raw.vid);
            if (!musicItem.primaryKey && detail.raw && detail.raw.mid) musicItem.primaryKey = String(detail.raw.mid);
            if (musicItem.artwork && musicItem.duration && musicItem.qualities) break;
          } catch (e) {
          }
        }
        return musicItem;
      }
      function haitangLevelOf(quality) {
        if (quality === "super") return "lossless";
        if (quality === "high") return "exhigh";
        if (quality === "hires") return "hires";
        return "standard";
      }
      var QUALITY_KEY_MAP = {
        "96k": "standard",
        "128k": "standard",
        "192k": "high",
        "320k": "high",
        "flac": "super",
        "flac24bit": "super",
        // [v1.9.23] hires/master 升为独立内部档（2026-10-20 全通道实测：a.aa.cab type5 臻品母带
        // 192kHz/24bit 4/4 歌真档、海棠 tx hires 96kHz/24bit 有货歌真档；v1.1.0 时代的 64B 占位/假链路
        // 已由新守门链路取代）；atmos/dolby/vinyl 实测仍全为假档（海棠同一下 3.28MB mp4 降档），
        // 继续映射 super，不声明（宁缺毋假）
        "hires": "hires",
        "master": "master",
        "atmos": "super",
        "atmos_plus": "super",
        "dolby": "super",
        "vinyl": "super"
      };
      function normalizeQuality(q) {
        var s = String(q || "");
        if (QUALITY_KEY_MAP[s]) return QUALITY_KEY_MAP[s];
        if (s === "standard" || s === "high" || s === "super") return s;
        return "standard";
      }
      function internalToHostQuality(q) {
        if (q === "high") return "320k";
        if (q === "super") return "flac";
        if (q === "master") return "master";
        if (q === "hires") return "hires";
        return "128k";
      }
      var LOSSY_TIERS = [64, 96, 128, 192, 256, 320];
      var LOSSLESS_LABELS = { flac: 1, flac24bit: 1, hires: 1, master: 1 };
      function snapQualityToMeasured(q, size, durationSec) {
        var label = String(q || "");
        var bytes = Number(size) || 0;
        var sec = Number(durationSec) || 0;
        if (!label || bytes <= 0 || sec <= 0) return label;
        var kbps = bytes * 8 / sec / 1e3;
        if (LOSSLESS_LABELS[label] && kbps >= 200) return label;
        var fit = 0;
        for (var i = 0; i < LOSSY_TIERS.length; i++) {
          if (LOSSY_TIERS[i] <= kbps * 1.03) fit = LOSSY_TIERS[i];
        }
        return fit ? fit + "k" : "64k";
      }
      function resolveHaitang(source, rid, quality) {
        var r = String(rid || "");
        return axios.post("https://musicserver.haitangw.cc/v1/music/resolve-url", {
          source,
          rid: r,
          level: haitangLevelOf(quality)
        }, {
          timeout: chainSegTimeout(RELAY_TIMEOUT),
          // v0.7.1 P1-3：接力段超时 2500ms
          headers: { Referer: "https://musicserver.haitangw.cc/", "Content-Type": "application/json" }
        }).then(function(res) {
          var d = res.data && res.data.data;
          if (!res.data || res.data.code !== 0 || !d || !d.url) throw new Error("haitang no url");
          var mediaUrl = String(d.url);
          return axios.get(mediaUrl, {
            timeout: 2e3,
            headers: { Range: "bytes=0-0" },
            responseType: "arraybuffer",
            validateStatus: function(s) {
              return s >= 200 && s < 300;
            }
          }).then(function(h) {
            var headers = h.headers || {};
            var size = 0;
            var cr = headers["content-range"] || headers["Content-Range"];
            var mm = cr && String(cr).match(/\/(\d+)\s*$/);
            if (mm) size = parseInt(mm[1], 10) || 0;
            else if (h.status !== 206) {
              var cl = headers["content-length"] || headers["Content-Length"];
              size = parseInt(cl, 10) || 0;
            }
            var out = { url: mediaUrl, actualQuality: internalToHostQuality(quality), channel: "qq:haitang" };
            if (size > 0) out.size = size;
            if (quality !== "hires") return out;
            return flacStreamInfo(mediaUrl).then(function(si) {
              out.actualQuality = si && si.sampleRate >= 88200 && si.bps >= 24 ? "hires" : si && si.bps >= 24 ? "flac24bit" : "flac";
              return out;
            });
          }).catch(function(e) {
            if (quality === "hires") throw e || new Error("haitang hires probe failed (fail-closed)");
            return { url: mediaUrl, actualQuality: internalToHostQuality(quality), channel: "qq:haitang" };
          });
        });
      }
      function thirdPartyTierOf(hostQuality) {
        if (hostQuality === "lossless" || hostQuality === "hires" || hostQuality === "master" || hostQuality === "flac24bit") return "master";
        if (hostQuality === "exhigh" || hostQuality === "flac") return "flac";
        if (hostQuality === "higher" || hostQuality === "320k" || hostQuality === "192k") return "320k";
        if (hostQuality === "standard" || hostQuality === "128k" || hostQuality === "hq") return "128k";
        return "128k";
      }
      function changqingTierOf(hostQuality) {
        if (hostQuality === "lossless" || hostQuality === "hires" || hostQuality === "master" || hostQuality === "flac24bit") return "flac24bit";
        if (hostQuality === "exhigh" || hostQuality === "flac") return "flac";
        if (hostQuality === "higher" || hostQuality === "320k" || hostQuality === "192k") return "320k";
        if (hostQuality === "standard" || hostQuality === "128k" || hostQuality === "hq") return "128k";
        return "128k";
      }
      function nianxinTierOf(hostQuality) {
        if (hostQuality === "lossless" || hostQuality === "hires" || hostQuality === "master" || hostQuality === "exhigh" || hostQuality === "flac" || hostQuality === "flac24bit") return "flac";
        if (hostQuality === "higher" || hostQuality === "320k" || hostQuality === "192k") return "320k";
        if (hostQuality === "standard" || hostQuality === "128k" || hostQuality === "hq") return "128k";
        return "128k";
      }
      function hostQualityToActual(hostQuality, actualTier) {
        if (actualTier === "flac24bit" || actualTier === "master") return "flac24bit";
        if (actualTier === "flac") return "flac";
        if (actualTier === "320k") return hostQuality === "192k" ? "192k" : "320k";
        if (actualTier === "128k") return "128k";
        if (hostQuality === "flac24bit") return "flac24bit";
        if (hostQuality === "master" || hostQuality === "hires" || hostQuality === "lossless" || hostQuality === "flac") return "flac";
        if (hostQuality === "320k" || hostQuality === "exhigh" || hostQuality === "higher") return "320k";
        if (hostQuality === "192k") return "192k";
        return "128k";
      }
      function verifyQualitySize(url, hostQuality) {
        return axios.get(url, {
          timeout: 2e3,
          headers: { Range: "bytes=0-4095" },
          responseType: "arraybuffer",
          validateStatus: function(s) {
            return s >= 200 && s < 300;
          }
        }).then(function(res) {
          var data = res.data;
          if (!data || !(data instanceof ArrayBuffer || data && data.byteLength !== void 0)) {
            throw new Error("verify: no arraybuffer");
          }
          var bytes = new Uint8Array(data instanceof ArrayBuffer ? data : data.buffer || data);
          if (bytes.length < 4) throw new Error("verify: response too short (" + bytes.length + "B)");
          var isFlac = bytes[0] === 102 && bytes[1] === 76 && bytes[2] === 97 && bytes[3] === 67;
          var isId3 = bytes[0] === 73 && bytes[1] === 68 && bytes[2] === 51;
          var isMpeg = bytes[0] === 255 && (bytes[1] & 224) === 224;
          var isAudioMagic = isFlac || isId3 || isMpeg;
          var expectFlac = /^(lossless|hires|master|flac|flac24bit|exhigh)$/i.test(String(hostQuality || ""));
          if (expectFlac && !isFlac) {
            throw new Error("verify: expected flac magic, got " + (isId3 ? "ID3" : isMpeg ? "MPEG" : "0x" + bytes[0].toString(16)));
          }
          if (!expectFlac && !isAudioMagic) {
            throw new Error("verify: expected lossy magic (ID3/MPEG), got 0x" + bytes[0].toString(16) + bytes[1].toString(16));
          }
          var headers = res.headers || {};
          var total = 0;
          var cr = headers["content-range"] || headers["Content-Range"];
          var mm = cr && String(cr).match(/\/(\d+)\s*$/);
          if (mm) {
            total = parseInt(mm[1], 10) || 0;
          } else if (res.status !== 206) {
            var cl = headers["content-length"] || headers["Content-Length"];
            total = parseInt(cl, 10) || 0;
          }
          if (total > 0) {
            var minSize = 2 * 1024 * 1024;
            if (total < minSize) {
              throw new Error("verify: total too small " + Math.round(total / 1024) + "KB (expect >= " + Math.round(minSize / 1024) + "KB)");
            }
          }
          return { url, magic: isFlac ? "fLaC" : isId3 ? "ID3" : "MPEG", total };
        });
      }
      function flacStreamInfo(url) {
        if (!url || typeof url !== "string") return Promise.resolve(null);
        return axios.get(url, {
          timeout: 2500,
          headers: { Range: "bytes=0-63", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
          responseType: "arraybuffer",
          validateStatus: function(s) {
            return s >= 200 && s < 300;
          }
        }).then(function(res) {
          var data = res.data;
          if (!data || !(data instanceof ArrayBuffer || data && data.byteLength !== void 0)) return null;
          var bytes = new Uint8Array(data instanceof ArrayBuffer ? data : data.buffer || data);
          if (bytes.length < 26) return null;
          if (bytes[0] !== 102 || bytes[1] !== 76 || bytes[2] !== 97 || bytes[3] !== 67) return null;
          var w = bytes[18] << 8 | bytes[19];
          var b12 = bytes[20], b13 = bytes[21];
          var sampleRate = w << 4 | b12 >> 4;
          var channels = (b12 >> 1 & 7) + 1;
          var bps = ((b12 & 1) << 4 | b13 >> 4) + 1;
          if (!sampleRate || !bps) return null;
          return { sampleRate, channels, bps };
        }).catch(function() {
          return null;
        });
      }
      var AAA_CAB_HOST = "https://a.aa.cab/qq.music";
      var AAA_CAB_TIPS_RANK = { "\u4F4E\u54C1\u8D28": 0, "\u4E2D\u54C1\u8D28": 1, "SQ\u65E0\u635F": 2, "\u81FB\u54C1\u5168\u666F\u58F0": 3, "\u81FB\u54C1\u6BCD\u5E26": 4 };
      var AAA_CAB_TIPS_ACTUAL = { "\u4F4E\u54C1\u8D28": "128k", "\u4E2D\u54C1\u8D28": "320k", "SQ\u65E0\u635F": "flac", "\u81FB\u54C1\u5168\u666F\u58F0": "flac24bit", "\u81FB\u54C1\u6BCD\u5E26": "master" };
      var AAA_CAB_ALLOWED_RE = /^(standard|128k|hq|mp3|aac|192k|higher|320k|exhigh|lossless|flac|super|flac24bit|hires|master)$/i;
      var AAA_CAB_LOSSY_PREFIX = { M500: "128k", C400: "128k", M800: "320k" };
      var AAA_CAB_PREFIX_RANK = { M500: 1, C400: 1, M800: 2, F000: 3, AI00: 5 };
      function aaaCabPrefixOf(url) {
        var m = String(url || "").match(/\/([A-Z][A-Z0-9]{3})[^/]*$/);
        return m ? m[1] : null;
      }
      function aaaCabTypeOf(hostQuality) {
        var q = String(hostQuality || "");
        if (/^(hires|master)$/i.test(q)) return 5;
        if (/^(lossless|flac|super|flac24bit)$/i.test(q)) return 4;
        if (/^(exhigh|higher|320k|192k)$/i.test(q)) return 1;
        return 0;
      }
      function qqAaaCabEnabled() {
        try {
          return String(userVariablesSafe().qqAaaCab || "").toLowerCase() !== "off";
        } catch (e) {
          return true;
        }
      }
      function aaaCabSongMatch(apiSong, apiSinger, reqName, reqSinger) {
        var as = String(apiSong || "").toLowerCase();
        var ar = String(apiSinger || "").toLowerCase();
        var ns = String(reqName || "").toLowerCase().trim();
        var nr = String(reqSinger || "").toLowerCase().trim();
        if (ns && as && as.indexOf(ns) < 0 && ns.indexOf(as) < 0) return false;
        if (nr && ar && ar.indexOf(nr) < 0 && nr.indexOf(ar) < 0) {
          var toks = nr.split(/[、/&，,+]|\s+feat\.?\s+|\s+ft\.?\s+/i);
          var hit = false;
          for (var i = 0; i < toks.length; i++) {
            var t = String(toks[i] || "").trim();
            if (t.length >= 2 && ar.indexOf(t) >= 0) {
              hit = true;
              break;
            }
          }
          if (!hit) return false;
        }
        return true;
      }
      function resolveQqAaaCab(raw, hostQuality, musicItem) {
        if (!qqAaaCabEnabled()) return Promise.reject(new Error("qqAaaCab \u5DF2\u5173\u95ED"));
        var name = String(musicItem && musicItem.title || "").trim();
        var singer = String(musicItem && musicItem.artist || "").trim();
        if (!name) return Promise.reject(new Error("aaacab: no keyword (musicItem.title empty)"));
        if (!AAA_CAB_ALLOWED_RE.test(String(hostQuality || ""))) {
          return Promise.reject(new Error('aaacab: quality "' + hostQuality + '" not allowed (\u65B9\u6848A \u62D2\u7EDD\u865A\u6807\uFF0C\u4EC5\u653E\u884C \u2264320k)'));
        }
        var type = aaaCabTypeOf(hostQuality);
        var url = AAA_CAB_HOST + "?msg=" + encodeURIComponent(name + (singer ? " " + singer : "")) + "&n=1&type=" + type;
        return axios.get(url, {
          timeout: chainSegTimeout(RELAY_TIMEOUT),
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
          validateStatus: function(s) {
            return s >= 200 && s < 300;
          }
        }).then(function(res) {
          var body = res.data;
          if (typeof body === "string") {
            var t = body.trim();
            if (!t || t.charAt(0) !== "{") throw new Error("aaacab: non-json response");
            body = JSON.parse(t);
          }
          if (!body || typeof body !== "object") throw new Error("aaacab: empty body");
          if (body.code !== 0) throw new Error("aaacab: code=" + body.code + " (1=\u8FD4\u56DE\u7A7A\uFF0Cmsg \u4E3A\u7A7A\u6216\u4E0D\u5408\u6CD5)");
          var d = body.data || {};
          var cand = typeof d.music === "string" && /^https?:\/\//i.test(d.music) ? d.music : null;
          if (!cand) throw new Error("aaacab: no music url");
          if (!isAllowedMediaUrl(cand)) throw new Error("aaacab: media url not in allowlist");
          if (!aaaCabSongMatch(d.song, d.singer, name, singer)) {
            throw new Error("aaacab: song mismatch (got " + String(d.song || "?") + " - " + String(d.singer || "?") + ")");
          }
          var prefix = aaaCabPrefixOf(cand);
          var prefixRank = prefix ? AAA_CAB_PREFIX_RANK[prefix] : void 0;
          if (!prefix || prefixRank === void 0) {
            throw new Error("aaacab: unknown url prefix (prefix=" + String(prefix || "?") + ", \u65B9\u6848A fail-closed)");
          }
          if (type >= 4) {
            var wantPrefix = type === 5 ? "AI00" : "F000";
            var wantTips = type === 5 ? "\u81FB\u54C1\u6BCD\u5E26" : "SQ\u65E0\u635F";
            var tipsHi = String(d.tips || "").trim();
            if (prefix !== wantPrefix) {
              throw new Error("aaacab: hi-tier prefix mismatch (got " + prefix + ", want " + wantPrefix + ", fail-closed)");
            }
            if (tipsHi !== wantTips) {
              throw new Error("aaacab: hi-tier tips mismatch (got " + (tipsHi || "(\u7A7A)") + ", want " + wantTips + ", fail-closed)");
            }
            var verifyQHi = type === 5 ? "master" : "flac";
            return verifyQualitySize(cand, verifyQHi).then(function(vs) {
              return flacStreamInfo(cand).then(function(si) {
                var aq;
                if (type === 5) {
                  aq = si && si.sampleRate >= 176400 && si.bps >= 24 ? "master" : si && si.sampleRate >= 88200 && si.bps >= 24 ? "hires" : si && si.bps >= 24 ? "flac24bit" : "flac";
                } else {
                  aq = si && si.bps >= 24 ? "flac24bit" : "flac";
                }
                var outHi = { url: cand, actualQuality: aq, channel: "qq:aaacab" };
                if (vs && vs.total > 0) outHi.size = vs.total;
                return outHi;
              });
            }).catch(function(e) {
              if (e instanceof SyntaxError) throw new Error("aaacab: parse fail");
              throw e;
            });
          }
          var reqRank = type;
          if (prefixRank < reqRank + 1) {
            throw new Error("aaacab: quality downgrade by prefix (prefix=" + prefix + ", want type=" + type + ")");
          }
          var tips = String(d.tips || "").trim();
          if (!tips || AAA_CAB_TIPS_RANK[tips] === void 0) {
            throw new Error("aaacab: unknown tips (tips=" + (tips || "(\u7A7A)") + ", \u65B9\u6848A fail-closed \u62D2\u7EDD\u865A\u6807)");
          }
          if (AAA_CAB_TIPS_RANK[tips] < reqRank) {
            throw new Error("aaacab: quality downgrade (tips=" + tips + ", want type=" + type + ")");
          }
          var out = {
            url: cand,
            // [v1.9.13] actualQuality 以前缀识别的实档为准（前缀 > tips > 请求档回退），宁低勿高
            actualQuality: AAA_CAB_LOSSY_PREFIX[prefix] || AAA_CAB_TIPS_ACTUAL[tips] || hostQualityToActual(hostQuality, type >= 1 ? "320k" : "128k"),
            channel: "qq:aaacab"
          };
          if (out.actualQuality === "320k" && /^192k$/i.test(String(hostQuality || ""))) out.actualQuality = "192k";
          var verifyQ = /^(exhigh|higher)$/i.test(String(hostQuality || "")) ? "320k" : hostQuality;
          return verifyQualitySize(cand, verifyQ).then(function(vs) {
            if (vs && vs.total > 0) out.size = vs.total;
            return out;
          });
        }).catch(function(e) {
          if (e instanceof SyntaxError) throw new Error("aaacab: parse fail");
          throw e;
        });
      }
      function resolveQqChangqing(raw, hostQuality) {
        if (!raw || !raw.mid) return Promise.reject(new Error("changqing: no mid"));
        if (hostQuality !== "standard" && hostQuality !== "128k" && hostQuality !== "hq") {
          return Promise.reject(new Error("changqing skipped: \u6052\u8FD4\u56DE 128k MP3\uFF0C\u8BF7\u6C42\u6863=" + hostQuality));
        }
        return axios.get("http://175.27.166.236/kgqq1/qq.php?ID=" + encodeURIComponent(String(raw.mid)) + "&q=128k", {
          timeout: chainSegTimeout(RELAY_TIMEOUT),
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
          validateStatus: function(s) {
            return s >= 200 && s < 300;
          }
        }).then(function(res) {
          var body = res.data;
          var d = body && body.data;
          var cand = d && typeof d.url === "string" && /^https?:\/\//i.test(d.url) ? d.url : null;
          if (!cand) {
            var msg = body && (body.msg || body.error) || "unknown";
            throw new Error("changqing: no url (msg=" + String(msg).slice(0, 60) + ")");
          }
          var respQ = d && d.quality;
          if (respQ && respQ !== "\u4F4E\u97F3\u8D28 MP3" && respQ !== "128k") {
            throw new Error("changqing: \u54CD\u5E94 quality=" + respQ + " \u4E0E\u8BF7\u6C42 128k \u4E0D\u7B26");
          }
          var size = 0;
          var sizeStr = d && d.size;
          if (typeof sizeStr === "string") {
            var sm = sizeStr.match(/^([\d.]+)\s*([KMGT]?B)$/i);
            if (sm) {
              var num = parseFloat(sm[1]);
              var unit = sm[2].toUpperCase();
              var mult = unit === "GB" ? 1024 * 1024 * 1024 : unit === "TB" ? 1024 * 1024 * 1024 * 1024 : unit === "KB" ? 1024 : unit === "MB" ? 1024 * 1024 : 1;
              size = Math.round(num * mult);
            } else if (/^\d+$/.test(sizeStr)) {
              size = parseInt(sizeStr, 10);
            }
          } else if (typeof sizeStr === "number" && sizeStr > 0) {
            size = sizeStr;
          }
          var out = { url: cand, actualQuality: "128k", _channel: "qq:changqing" };
          if (size > 0) out.size = size;
          return out;
        }).then(function(r) {
          return verifyQualitySize(r.url, hostQuality).then(function(vs) {
            if (!r.size && vs && vs.total > 0) r.size = vs.total;
            return { url: r.url, actualQuality: r.actualQuality, channel: "qq:changqing", size: r.size || 0 };
          });
        });
      }
      function qqXunhuisiEnabled() {
        return String(userVariablesSafe().qqXunhuisi || "").toLowerCase() !== "off";
      }
      function verifyM4aQualitySize(url) {
        return axios.get(url, {
          timeout: 2e3,
          headers: { Range: "bytes=0-4095" },
          responseType: "arraybuffer",
          validateStatus: function(s) {
            return s >= 200 && s < 300;
          }
        }).then(function(res) {
          var data = res.data;
          if (!data || !(data instanceof ArrayBuffer || data && data.byteLength !== void 0)) {
            throw new Error("xunhuisi verify: no arraybuffer");
          }
          var bytes = new Uint8Array(data instanceof ArrayBuffer ? data : data.buffer || data);
          if (bytes.length < 8) throw new Error("xunhuisi verify: response too short (" + bytes.length + "B)");
          var isFlac = bytes[0] === 102 && bytes[1] === 76 && bytes[2] === 97 && bytes[3] === 67;
          var isId3 = bytes[0] === 73 && bytes[1] === 68 && bytes[2] === 51;
          var isMpeg = bytes[0] === 255 && (bytes[1] & 224) === 224;
          var isFtyp = bytes[4] === 102 && bytes[5] === 116 && bytes[6] === 121 && bytes[7] === 112;
          if (!isFlac && !isId3 && !isMpeg && !isFtyp) {
            throw new Error("xunhuisi verify: not audio magic, got 0x" + bytes[0].toString(16) + bytes[1].toString(16));
          }
          var headers = res.headers || {};
          var total = 0;
          var cr = headers["content-range"] || headers["Content-Range"];
          var mm = cr && String(cr).match(/\/(\d+)\s*$/);
          if (mm) total = parseInt(mm[1], 10) || 0;
          else if (res.status !== 206) {
            var cl = headers["content-length"] || headers["Content-Length"];
            total = parseInt(cl, 10) || 0;
          }
          if (total > 0 && total < 2 * 1024 * 1024) {
            throw new Error("xunhuisi verify: total too small " + Math.round(total / 1024) + "KB (expect >= 2MB)");
          }
          return { total, magic: isFtyp ? "ftyp" : isFlac ? "fLaC" : isId3 ? "ID3" : "MPEG" };
        });
      }
      function resolveQqXunhuisi(raw, hostQuality) {
        if (!raw || !raw.mid) return Promise.reject(new Error("xunhuisi: no mid"));
        if (!/^(standard|128k|hq|mp3|aac|192k|higher|320k|exhigh)$/i.test(String(hostQuality || ""))) {
          return Promise.reject(new Error("xunhuisi skipped: \u65E0\u635F/\u6BCD\u5E26\u8BF7\u6C42\u6863=" + hostQuality));
        }
        return axios.get("https://api.xunhuisi.store/API/QQMusic/Song.php", {
          params: { mid: String(raw.mid) },
          timeout: chainSegTimeout(RELAY_TIMEOUT),
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
          validateStatus: function(s) {
            return s >= 200 && s < 300;
          }
        }).then(function(res) {
          var j = res.data;
          var cand = j && typeof j.music_url === "string" && /^https?:\/\//i.test(j.music_url) ? j.music_url : null;
          if (!cand) {
            var msg = j && (j.msg || j.error || j.message) || "unknown";
            throw new Error("xunhuisi: no url (msg=" + String(msg).slice(0, 60) + ")");
          }
          return verifyM4aQualitySize(cand).then(function(vs) {
            return { url: cand, actualQuality: "320k", channel: "qq:xunhuisi", size: vs && vs.total || 0 };
          });
        });
      }
      function resolveQqNianxin(raw, hostQuality) {
        if (!raw || !raw.mid) return Promise.reject(new Error("nianxin: no mid"));
        return Promise.reject(new Error("nianxin channel disabled since 2026-09-11 (mcp.nianxinxz.com/ceshi 404 \u7AD9\u70B9\u4E0B\u7EBF)"));
      }
      var S01S_MID_FIELD_ORDER = {
        master: ["song_play_url_pq", "song_play_url_sq", "song_play_url_accom", "song_play_url", "song_play_url_hq", "song_play_url_standard", "song_play_url_fq"],
        hires: ["song_play_url_pq", "song_play_url_sq", "song_play_url_accom", "song_play_url", "song_play_url_hq", "song_play_url_standard", "song_play_url_fq"],
        "flac24bit": ["song_play_url_pq", "song_play_url_sq", "song_play_url", "song_play_url_hq", "song_play_url_standard", "song_play_url_fq"],
        flac: ["song_play_url_sq", "song_play_url", "song_play_url_hq", "song_play_url_standard", "song_play_url_fq"],
        "320k": ["song_play_url_hq", "song_play_url", "song_play_url_sq", "song_play_url_standard", "song_play_url_fq"],
        "128k": ["song_play_url_standard", "song_play_url", "song_play_url_hq", "song_play_url_fq", "song_play_url_sq"]
      };
      var S01S_MID_ACTUAL = {
        song_play_url_pq: "flac24bit",
        song_play_url_sq: "flac",
        song_play_url_accom: "flac",
        song_play_url_hq: "320k",
        song_play_url_standard: "320k",
        song_play_url: "128k",
        song_play_url_fq: "128k"
      };
      function qqS01sMidEnabled() {
        try {
          return String(userVariablesSafe().qqS01sMid || "").toLowerCase() !== "off";
        } catch (e) {
          return true;
        }
      }
      function resolveQqS01sMid(raw, hostQuality) {
        if (!raw || !raw.mid) return Promise.reject(new Error("s01s-mid: no mid"));
        var tier = thirdPartyTierOf(hostQuality);
        return axios.get(S01S_HOST + "music_open_api.php", {
          params: { mid: raw.mid },
          timeout: chainSegTimeout(RELAY_TIMEOUT),
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
          validateStatus: function(s) {
            return s >= 200 && s < 300;
          }
        }).then(function(res) {
          var body = res.data;
          if (typeof body === "string") {
            var t = body.trim();
            if (!t || t.charAt(0) !== "{") throw new Error("s01s-mid non-json response");
            body = JSON.parse(t);
          }
          var order = S01S_MID_FIELD_ORDER[tier] || S01S_MID_FIELD_ORDER["128k"];
          for (var fi = 0; fi < order.length; fi++) {
            var fk = order[fi];
            var u = body && body[fk];
            if (u && typeof u === "string" && /^https?:\/\//i.test(u)) {
              var sizeKey = fk.replace(/^song_play_url_/, "song_size_") + "_str";
              var size = parseInt(body[sizeKey], 10) || 0;
              var out = { url: u, actualQuality: S01S_MID_ACTUAL[fk] || "128k", _channel: "qq:s01s-mid" };
              if (size > 0) out.size = size;
              return out;
            }
          }
          throw new Error("s01s-mid: no url for tier " + tier);
        }).then(function(r) {
          return verifyQualitySize(r.url, hostQuality).then(function(vs) {
            if (!r.size && vs && vs.total > 0) r.size = vs.total;
            return { url: r.url, actualQuality: r.actualQuality, channel: "qq:s01s-mid", size: r.size || 0 };
          });
        }).catch(function(e) {
          if (e instanceof SyntaxError) throw new Error("s01s-mid parse fail");
          throw e;
        });
      }
      function userVariablesSafe() {
        var env = typeof globalThis !== "undefined" && globalThis.env ? globalThis.env : null;
        if (env && env.getUserVariables) {
          try {
            return env.getUserVariables() || {};
          } catch (e) {
          }
        }
        return {};
      }
      function qqCookieValue() {
        var ck = userVariablesSafe().qqCookie;
        return ck ? String(ck) : "";
      }
      function qqCookieHeaders(base) {
        var h = {};
        var k;
        for (k in base || {}) {
          if (Object.prototype.hasOwnProperty.call(base, k)) h[k] = base[k];
        }
        var ck = qqCookieValue();
        if (ck) h.Cookie = ck;
        return h;
      }
      function qqLoginState() {
        var uv = userVariablesSafe();
        var authst = uv.qqAuthst ? String(uv.qqAuthst).trim() : "";
        var uin = uv.qqUin ? String(uv.qqUin).trim() : "";
        var cookie = qqCookieValue();
        if (cookie) {
          if (!authst) {
            var mk = /(?:^|;\s*)qm_keyst=([^;]+)/.exec(cookie);
            if (mk) authst = mk[1].trim();
          }
          if (!uin) {
            var mu = /(?:^|;\s*)(?:wxuin|uin)=o?(\d{5,})/i.exec(cookie);
            if (mu) uin = mu[1];
          }
        }
        if (!authst) return null;
        return { authst, uin: uin || "0" };
      }
      function resolveQqBugpk(raw, quality) {
        return Promise.reject(new Error("bugpk disabled: api.bugpk.com unreachable (probe 2026-09-27)"));
        if (!raw || !raw.mid) return Promise.reject(new Error("bugpk no mid"));
        return axios.get("https://api.bugpk.com/api/music", {
          params: { id: raw.mid, media: "tencent", type: "song" },
          timeout: chainSegTimeout(RELAY_TIMEOUT),
          // v0.7.1 P1-3：接力段超时 2500ms
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        }).then(function(res) {
          var body = res.data || {};
          var d = body.data || body;
          var url = d && d.url;
          if (!url || typeof url !== "string" || url.indexOf("http") !== 0) {
            throw new Error("bugpk no url (" + String(body.msg || body.message || "").slice(0, 40) + ")");
          }
          return { url, actualQuality: "128k", channel: "qq:bugpk" };
        });
      }
      function randomGuid() {
        var s = "";
        var chars = "0123456789abcdef";
        for (var i = 0; i < 32; i++) s += chars.charAt(Math.floor(Math.random() * 16));
        return s;
      }
      var QQ_BATCH_PREFIXES = [
        { prefix: "AI00", ext: "flac", tiers: ["super"], aq: "flac" },
        { prefix: "Q001", ext: "flac", tiers: ["super"], aq: "flac" },
        { prefix: "Q000", ext: "flac", tiers: ["super"], aq: "flac" },
        { prefix: "F000", ext: "flac", tiers: ["super"], aq: "flac" },
        { prefix: "O801", ext: "flac", tiers: ["super"], aq: "flac" },
        { prefix: "M800", ext: "mp3", tiers: ["high"], aq: "320k" },
        { prefix: "M500", ext: "mp3", tiers: ["standard"], aq: "128k" }
      ];
      var QQ_XFF_IP_POOL = [
        "116.25.146.177",
        "112.17.56.88",
        "219.136.87.4",
        "61.141.204.101",
        "183.62.115.9",
        "121.33.190.200",
        "113.108.238.51",
        "202.104.135.68",
        "58.62.53.77",
        "14.215.151.6"
      ];
      function randomDomesticIP() {
        return QQ_XFF_IP_POOL[Math.floor(Math.random() * QQ_XFF_IP_POOL.length)];
      }
      var QQ_EV_HOSTS = [
        { base: "https://ut.y.qq.com/cgi-bin/musicu.fcg", cv: "1803" },
        { base: "https://u.y.qq.com/cgi-bin/musicu.fcg", cv: "0" }
      ];
      function qqEvkeyRequest(hostConf, raw, filename) {
        var login = qqLoginState();
        var evComm = { ct: "19", cv: hostConf.cv, guid: randomGuid(), tmeAppID: "qqmusic", qq: "0" };
        if (login) {
          evComm.uin = login.uin;
          evComm.qq = login.uin;
          evComm.authst = login.authst;
        }
        var body = {
          comm: evComm,
          req_vkey: {
            module: "music.vkey.GetEVkey",
            method: "CgiGetHotVkey",
            param: { filename: [filename], songmid: [raw.mid] }
          },
          req_ekey: {
            module: "music.vkey.GetEVkey",
            method: "GetEkey",
            param: { finfo: [{ filename, mid: raw.mid }] }
          }
        };
        return axios.post(hostConf.base, body, {
          timeout: chainSegTimeout(SOURCE_TIMEOUT),
          headers: qqCookieHeaders({
            "User-Agent": "HotDownloader/1.0",
            Referer: "https://y.qq.com/",
            "Content-Type": "application/json"
          })
        }).then(function(res) {
          var rd = res.data || {};
          var urls = rd.req_vkey && rd.req_vkey.data && rd.req_vkey.data.urls;
          var purl = urls && urls[0] && urls[0].purl;
          if (!purl) throw new Error("qq evkey no purl");
          var sipPrefix = "https://wx.music.tc.qq.com/";
          var evSip = rd.req_vkey.data.sip && rd.req_vkey.data.sip[0];
          if (evSip && typeof evSip === "string" && /^https?:\/\//i.test(evSip) && isAllowedMediaUrl(evSip)) {
            sipPrefix = evSip.charAt(evSip.length - 1) === "/" ? evSip : evSip + "/";
          }
          var infos = rd.req_ekey && rd.req_ekey.data && rd.req_ekey.data.ekeyinfo;
          var ekey = infos && infos[0] && infos[0].ekey;
          var out = { url: sipPrefix + String(purl), channel: "qq:evkey" };
          out.actualQuality = "flac";
          if (ekey) out.ekey = String(ekey);
          return out;
        });
      }
      function qqEvkeyEnabled() {
        var env = typeof globalThis !== "undefined" && globalThis.env ? globalThis.env : null;
        if (env && env.getUserVariables) {
          try {
            var uv = env.getUserVariables();
            if (uv && String(uv.qqEvkey).toLowerCase() === "off") return false;
          } catch (e) {
          }
        }
        return true;
      }
      function u32(x) {
        return x | 0;
      }
      function utf8Bytes(s) {
        var out = [];
        for (var i = 0; i < s.length; i++) {
          var c = s.charCodeAt(i);
          if (c < 128) {
            out.push(c);
          } else if (c < 2048) {
            out.push(192 | c >> 6, 128 | c & 63);
          } else if (c >= 55296 && c <= 56319 && i + 1 < s.length) {
            var c2 = s.charCodeAt(i + 1);
            var cp = 65536 + (c - 55296 << 10) + (c2 - 56320);
            i++;
            out.push(240 | cp >> 18, 128 | cp >> 12 & 63, 128 | cp >> 6 & 63, 128 | cp & 63);
          } else {
            out.push(224 | c >> 12, 128 | c >> 6 & 63, 128 | c & 63);
          }
        }
        return out;
      }
      function bt64(sel, lo, hi) {
        var rlo = 0, rhi = 0;
        for (var i = 0; i < sel.length; i++) {
          var idx = sel[i];
          if (idx >= 0) {
            var bit = idx < 32 ? lo >>> idx & 1 : hi >>> idx - 32 & 1;
            if (bit) {
              if (i < 32) rlo |= 1 << i;
              else rhi |= 1 << i - 32;
            }
          }
        }
        return [rlo | 0, rhi | 0];
      }
      var KW_ARRAYLS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];
      var KW_ARRAYLSMASK = [0, 1048577, 3145731];
      var KW_ARRAYE = [31, 0, 1, 2, 3, 4, -1, -1, 3, 4, 5, 6, 7, 8, -1, -1, 7, 8, 9, 10, 11, 12, -1, -1, 11, 12, 13, 14, 15, 16, -1, -1, 15, 16, 17, 18, 19, 20, -1, -1, 19, 20, 21, 22, 23, 24, -1, -1, 23, 24, 25, 26, 27, 28, -1, -1, 27, 28, 29, 30, 31, 30, -1, -1];
      var KW_ARRAYIP1 = [39, 7, 47, 15, 55, 23, 63, 31, 38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29, 36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27, 34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25, 32, 0, 40, 8, 48, 16, 56, 24];
      var KW_ARRAYIP2 = [57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3, 61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7, 56, 48, 40, 32, 24, 16, 8, 0, 58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4, 62, 54, 46, 38, 30, 22, 14, 6];
      var KW_ARRAYP = [15, 6, 19, 20, 28, 11, 27, 16, 0, 14, 22, 25, 4, 17, 30, 9, 1, 7, 23, 13, 31, 26, 2, 8, 18, 12, 29, 5, 21, 10, 3, 24];
      var KW_ARRAYPC1 = [56, 48, 40, 32, 24, 16, 8, 0, 57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 60, 52, 44, 36, 28, 20, 12, 4, 27, 19, 11, 3];
      var KW_ARRAYPC2 = [13, 16, 10, 23, 0, 4, -1, -1, 2, 27, 14, 5, 20, 9, -1, -1, 22, 18, 11, 3, 25, 7, -1, -1, 15, 6, 26, 19, 12, 1, -1, -1, 40, 51, 30, 36, 46, 54, -1, -1, 29, 39, 50, 44, 32, 47, -1, -1, 43, 48, 38, 55, 33, 52, -1, -1, 45, 41, 49, 35, 28, 31, -1, -1];
      var KW_SBOX = [
        [14, 4, 3, 15, 2, 13, 5, 3, 13, 14, 6, 9, 11, 2, 0, 5, 4, 1, 10, 12, 15, 6, 9, 10, 1, 8, 12, 7, 8, 11, 7, 0, 0, 15, 10, 5, 14, 4, 9, 10, 7, 8, 12, 3, 13, 1, 3, 6, 15, 12, 6, 11, 2, 9, 5, 0, 4, 2, 11, 14, 1, 7, 8, 13],
        [15, 0, 9, 5, 6, 10, 12, 9, 8, 7, 2, 12, 3, 13, 5, 2, 1, 14, 7, 8, 11, 4, 0, 3, 14, 11, 13, 6, 4, 1, 10, 15, 3, 13, 12, 11, 15, 3, 6, 0, 4, 10, 1, 7, 8, 4, 11, 14, 13, 8, 0, 6, 2, 15, 9, 5, 7, 1, 10, 12, 14, 2, 5, 9],
        [10, 13, 1, 11, 6, 8, 11, 5, 9, 4, 12, 2, 15, 3, 2, 14, 0, 6, 13, 1, 3, 15, 4, 10, 14, 9, 7, 12, 5, 0, 8, 7, 13, 1, 2, 4, 3, 6, 12, 11, 0, 13, 5, 14, 6, 8, 15, 2, 7, 10, 8, 15, 4, 9, 11, 5, 9, 0, 14, 3, 10, 7, 1, 12],
        [7, 10, 1, 15, 0, 12, 11, 5, 14, 9, 8, 3, 9, 7, 4, 8, 13, 6, 2, 1, 6, 11, 12, 2, 3, 0, 5, 14, 10, 13, 15, 4, 13, 3, 4, 9, 6, 10, 1, 12, 11, 0, 2, 5, 0, 13, 14, 2, 8, 15, 7, 4, 15, 1, 10, 7, 5, 6, 12, 11, 3, 8, 9, 14],
        [2, 4, 8, 15, 7, 10, 13, 6, 4, 1, 3, 12, 11, 7, 14, 0, 12, 2, 5, 9, 10, 13, 0, 3, 1, 11, 15, 5, 6, 8, 9, 14, 14, 11, 5, 6, 4, 1, 3, 10, 2, 12, 15, 0, 13, 2, 8, 5, 11, 8, 0, 15, 7, 14, 9, 4, 12, 7, 10, 9, 1, 13, 6, 3],
        [12, 9, 0, 7, 9, 2, 14, 1, 10, 15, 3, 4, 6, 12, 5, 11, 1, 14, 13, 0, 2, 8, 7, 13, 15, 5, 4, 10, 8, 3, 11, 6, 10, 4, 6, 11, 7, 9, 0, 6, 4, 2, 13, 1, 9, 15, 3, 8, 15, 3, 1, 14, 12, 5, 11, 0, 2, 12, 14, 7, 5, 10, 8, 13],
        [4, 1, 3, 10, 15, 12, 5, 0, 2, 11, 9, 6, 8, 7, 6, 9, 11, 4, 12, 15, 0, 3, 10, 5, 14, 13, 7, 8, 13, 14, 1, 2, 13, 6, 14, 9, 4, 1, 2, 14, 11, 13, 5, 0, 1, 10, 8, 3, 0, 11, 3, 5, 9, 4, 15, 2, 7, 8, 12, 15, 10, 7, 6, 12],
        [13, 7, 10, 0, 6, 9, 5, 15, 8, 4, 3, 10, 11, 14, 12, 5, 2, 11, 9, 6, 15, 12, 0, 3, 4, 1, 14, 13, 1, 2, 7, 8, 1, 2, 12, 15, 10, 4, 0, 3, 13, 14, 6, 9, 7, 8, 9, 6, 15, 1, 5, 12, 3, 10, 14, 5, 8, 7, 11, 0, 4, 13, 2, 11]
      ];
      function kwDesBlock(subkeys, lo, hi) {
        var ip = bt64(KW_ARRAYIP2, lo, hi);
        var L = ip[0], R = ip[1];
        for (var i = 0; i < 16; i++) {
          var e = bt64(KW_ARRAYE, R, 0);
          var xlo = e[0] ^ subkeys[i][0], xhi = e[1] ^ subkeys[i][1];
          var sOut = 0;
          for (var sbi = 7; sbi >= 0; sbi--) {
            var b;
            if (sbi < 4) b = xlo >>> 8 * sbi & 255;
            else b = xhi >>> 8 * (sbi - 4) & 255;
            sOut = (sOut << 4 | KW_SBOX[sbi][b]) >>> 0;
          }
          var p = bt64(KW_ARRAYP, sOut, 0)[0];
          var newR = u32(L ^ p);
          L = R;
          R = newR;
        }
        var t = L;
        L = R;
        R = t;
        return bt64(KW_ARRAYIP1, L, R);
      }
      var KW_SUBKEY_CACHE = {};
      function kwSubkeys(keyStr) {
        if (KW_SUBKEY_CACHE[keyStr]) return KW_SUBKEY_CACHE[keyStr];
        var klo = 0, khi = 0;
        for (var i = 0; i < 8; i++) {
          var b = keyStr.charCodeAt(i) & 255;
          if (i < 4) klo |= b << 8 * i;
          else khi |= b << 8 * (i - 4);
        }
        var x = bt64(KW_ARRAYPC1, klo, khi);
        var keys = [];
        for (var r = 0; r < 16; r++) {
          var shift = KW_ARRAYLS[r];
          var mask = KW_ARRAYLSMASK[shift];
          var maskedLo = x[0] & mask;
          var restLo = x[0] & ~mask | 0, restHi = x[1];
          var shrLo = restLo >>> shift | restHi << 32 - shift;
          var shrHi = restHi >>> shift;
          var sl = 28 - shift;
          var shlLo = maskedLo << sl;
          var shlHi = maskedLo >>> 32 - sl;
          var nxlo = shlLo | shrLo | 0, nxhi = shlHi | shrHi | 0;
          keys.push(bt64(KW_ARRAYPC2, nxlo, nxhi));
          x = [nxlo, nxhi];
        }
        KW_SUBKEY_CACHE[keyStr] = keys;
        return keys;
      }
      function kwDesEncryptBytes(bytes, keyStr) {
        var sub = kwSubkeys(keyStr);
        var j = Math.floor(bytes.length / 8);
        var out = [];
        var blocks = [];
        for (var m = 0; m < j; m++) {
          var lo = 0, hi = 0;
          for (var n = 0; n < 8; n++) {
            var b = bytes[m * 8 + n] & 255;
            if (n < 4) lo |= b << 8 * n;
            else hi |= b << 8 * (n - 4);
          }
          blocks.push(kwDesBlock(sub, lo | 0, hi | 0));
        }
        var rem = bytes.length % 8;
        var rlo = 0, rhi = 0;
        for (var n2 = 0; n2 < rem; n2++) {
          var b2 = bytes[j * 8 + n2] & 255;
          if (n2 < 4) rlo |= b2 << 8 * n2;
          else rhi |= b2 << 8 * (n2 - 4);
        }
        if (rem !== 0 || true) blocks.push(kwDesBlock(sub, rlo | 0, rhi | 0));
        for (var k = 0; k < blocks.length; k++) {
          out.push(blocks[k][0] & 255, blocks[k][0] >>> 8 & 255, blocks[k][0] >>> 16 & 255, blocks[k][0] >>> 24 & 255);
          out.push(blocks[k][1] & 255, blocks[k][1] >>> 8 & 255, blocks[k][1] >>> 16 & 255, blocks[k][1] >>> 24 & 255);
        }
        return out;
      }
      function kwBase64(bytes) {
        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        var out = "";
        for (var i = 0; i < bytes.length; i += 3) {
          var b0 = bytes[i], b1 = i + 1 < bytes.length ? bytes[i + 1] : 0, b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
          out += chars[b0 >> 2];
          out += chars[(b0 & 3) << 4 | b1 >> 4];
          out += i + 1 < bytes.length ? chars[(b1 & 15) << 2 | b2 >> 6] : "=";
          out += i + 2 < bytes.length ? chars[b2 & 63] : "=";
        }
        return out;
      }
      function kuwoEncryptQuery(query, keyStr) {
        return kwBase64(kwDesEncryptBytes(utf8Bytes(query), keyStr));
      }
      function kuwoRaceSuccess(promises) {
        return new Promise(function(resolve, reject) {
          if (!promises.length) {
            reject(new Error("kuwo no racers"));
            return;
          }
          var failed = 0;
          promises.forEach(function(p) {
            Promise.resolve(p).then(resolve, function() {
              failed++;
              if (failed === promises.length) reject(new Error("kuwo all racers failed"));
            });
          });
        });
      }
      function racePriority(builds) {
        return new Promise(function(resolve, reject) {
          var pending = builds.length, failed = 0, settled = false;
          if (!pending) {
            reject(new Error("racePriority: \u65E0\u5019\u9009"));
            return;
          }
          var launched = [], timers = [], controllers = [];
          function finish(fn, val) {
            if (settled) return;
            settled = true;
            for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
            for (var j = 0; j < controllers.length; j++) {
              try {
                if (controllers[j] && typeof controllers[j].abort === "function") controllers[j].abort();
              } catch (e) {
              }
            }
            fn(val);
          }
          function launch(i) {
            if (settled || launched[i]) return;
            launched[i] = true;
            var b = builds[i];
            var ctrl = typeof AbortController === "function" ? new AbortController() : null;
            if (ctrl) controllers.push(ctrl);
            var buildFn = b.build;
            if (ctrl && typeof buildFn === "function" && buildFn.length >= 1) {
              var orig = buildFn;
              buildFn = function() {
                return orig(ctrl.signal);
              };
            }
            Promise.resolve().then(buildFn).then(function(v) {
              if (b.tag && v && typeof v === "object" && !v.channel) v.channel = b.tag;
              finish(resolve, v);
            }, function() {
              failed++;
              if (failed === pending) {
                finish(reject, new Error("racePriority: \u5168\u90E8\u5019\u9009\u5931\u8D25"));
                return;
              }
              for (var n = i + 1; n < pending; n++) {
                if (!launched[n]) {
                  launch(n);
                  break;
                }
              }
            });
          }
          builds.forEach(function(b, i) {
            if (!b.delay) {
              launch(i);
              return;
            }
            timers.push(setTimeout(function() {
              launch(i);
            }, b.delay));
          });
        });
      }
      var RACE_HEADROOM_MS = 500;
      var RACE_STEP_MS = 250;
      var RACE_STEP_MAX = 1200;
      var raceDelay = function(rank) {
        return rank <= 0 ? 0 : Math.min(RACE_STEP_MAX, RACE_HEADROOM_MS + (rank - 1) * RACE_STEP_MS);
      };
      var KUWO_BR = { low: "48kaac", standard: "128kmp3", high: "320kmp3", super: "2000kflac" };
      var KW_VERSION_KEYWORDS = [
        ["live", ["live\u7248", "\u73B0\u573A\u7248", "\u6F14\u5531\u4F1A\u7248", "\u6F14\u5531\u4F1A", "\u7EAF\u4EAB\u7248", "live"]],
        ["instrumental", ["\u4F34\u594F\u7248", "\u4F34\u594F", "\u7EAF\u97F3\u4E50\u7248", "\u7EAF\u97F3\u4E50", "instrumental"]],
        ["remix", ["remix\u7248", "remix", "\u6DF7\u97F3\u7248", "\u6DF7\u97F3"]],
        ["dj", ["dj\u7248", "dj"]],
        ["cover", ["\u7FFB\u5531\u7248", "\u7FFB\u5531", "cover\u7248", "cover"]],
        ["movie", ["\u7535\u5F71\u7248", "\u7535\u5F71"]],
        ["tv", ["\u7535\u89C6\u5267\u7248", "\u7535\u89C6\u5267"]],
        ["clip", ["\u7247\u6BB5", "\u8282\u9009"]],
        ["ring", ["\u94C3\u58F0\u7248", "\u94C3\u58F0"]],
        ["spatial", ["3d\u73AF\u7ED5", "\u73AF\u7ED5\u7248", "\u73AF\u7ED5", "3d"]],
        ["piano", ["\u94A2\u7434\u7248", "\u94A2\u7434", "piano\u7248", "piano"]],
        ["guitar", ["\u5409\u4ED6\u7248", "\u5409\u4ED6"]],
        ["female", ["\u5973\u58F0\u7248", "\u5973\u58F0"]],
        ["male", ["\u7537\u58F0\u7248", "\u7537\u58F0"]],
        ["child", ["\u7AE5\u58F0\u7248", "\u7AE5\u58F0"]],
        ["full", ["\u5B8C\u6574\u7248"]]
      ];
      var KW_ORIGINAL_KEYWORDS = ["\u539F\u7248", "\u539F\u66F2\u7248"];
      function kwMatchAtTail(token) {
        var best = null;
        function consider(kw, type) {
          if (!kw || token.length < kw.length || token.slice(token.length - kw.length) !== kw) return;
          if (token.length > kw.length) {
            var prev = token.charAt(token.length - kw.length - 1);
            if (/[a-z0-9]/.test(kw.charAt(0)) && /[a-z0-9]/.test(prev)) return;
          }
          if (!best || kw.length > best.len) best = { type, len: kw.length };
        }
        for (var i = 0; i < KW_VERSION_KEYWORDS.length; i++) {
          var vars = KW_VERSION_KEYWORDS[i][1];
          for (var j = 0; j < vars.length; j++) consider(vars[j], KW_VERSION_KEYWORDS[i][0]);
        }
        for (var k = 0; k < KW_ORIGINAL_KEYWORDS.length; k++) consider(KW_ORIGINAL_KEYWORDS[k], "original");
        return best;
      }
      function kuwoVersionSplit(rawTitle) {
        var t = String(rawTitle || "").toLowerCase().replace(/\s*\b(?:featuring|feat|ft)\.?\b[\s\S]*$/i, "").replace(/[（(【\[{〔]/g, " ").replace(/[）)】\]}〕]/g, " ").replace(/[\s·・~～_\-—–|｜:：、,，.。!！?？'""「」『』·]+/g, " ").trim();
        var tokens = t ? t.split(" ") : [];
        var tags = [];
        var idx = tokens.length - 1;
        while (idx >= 0) {
          var m = kwMatchAtTail(tokens[idx]);
          if (!m) break;
          if (m.type !== "original") tags.push(m.type);
          var rest = tokens[idx].slice(0, tokens[idx].length - m.len).replace(/[·・_\-—–|｜]+$/g, "");
          if (rest) {
            tokens[idx] = rest;
          } else {
            idx--;
          }
        }
        var core = tokens.slice(0, idx + 1).join("").replace(/[^0-9a-z\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g, "");
        var seen = {}, out = [];
        for (var k = 0; k < tags.length; k++) {
          if (!seen[tags[k]]) {
            seen[tags[k]] = 1;
            out.push(tags[k]);
          }
        }
        return { core, tags: out };
      }
      function kuwoArtistSet(raw) {
        var s = String(raw || "").toLowerCase().replace(/\(\s*feat[\s\S]*?\)/g, " ");
        var parts = s.split(/\s*(?:、|，|,|\/|&|;|；|\bfeat\.?|\bfeaturing\b|\bft\.?|和|与|×)\s*/);
        var seen = {}, out = [];
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i].replace(/[^0-9a-z\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/g, "");
          if (p && !seen[p]) {
            seen[p] = 1;
            out.push(p);
          }
        }
        return out;
      }
      function kuwoSameTrackCheck(qqItem, cand) {
        var a = kuwoVersionSplit(qqItem && (qqItem.title || qqItem.name));
        var b = kuwoVersionSplit(cand && cand.title);
        if (!a.core || !b.core) return { ok: false, reason: "core-title-empty: [" + (a.core || b.core) + "]" };
        if (a.core !== b.core) return { ok: false, reason: "core-title-mismatch: [" + a.core + "] vs [" + b.core + "]" };
        var ta = a.tags.slice().sort().join("+");
        var tb = b.tags.slice().sort().join("+");
        if (ta !== tb) return { ok: false, reason: "version-tag-mismatch: [" + ta + "] vs [" + tb + "]" };
        var aa = kuwoArtistSet(qqItem && qqItem.artist);
        var ba = kuwoArtistSet(cand && cand.artist);
        var hit = "";
        for (var i = 0; i < aa.length && !hit; i++) {
          for (var j = 0; j < ba.length; j++) {
            if (aa[i] === ba[j]) {
              hit = aa[i];
              break;
            }
          }
        }
        if (!hit) return { ok: false, reason: "artist-mismatch: [" + aa.join("|") + "] vs [" + ba.join("|") + "]" };
        var dq = parseInt(qqItem && qqItem.duration, 10) || 0;
        var dk = parseInt(cand && cand.duration, 10) || 0;
        if (dq > 0 && dk > 0 && Math.abs(dq - dk) / dq > 0.1) {
          return { ok: false, reason: "duration-mismatch: qq=" + dq + "s kuwo=" + dk + "s (>10%)" };
        }
        return { ok: true, reason: "" };
      }
      function searchKuwoCandidates(query) {
        return axios.get("https://www.kuwo.cn/search/searchMusicBykeyWord", {
          params: {
            all: query,
            pn: 0,
            rn: 20,
            ft: "music",
            client: "kt",
            encoding: "utf8",
            rformat: "json",
            mobi: 1,
            vipver: 1,
            cluster: 0,
            strategy: 2012,
            issubtitle: 1,
            show_copyright_off: 1,
            correct: 1,
            spPrivilege: 0,
            newver: 2,
            p2p: 1,
            notrace: 0,
            searchapi: 2,
            vermerge: 1
          },
          timeout: chainSegTimeout(SOURCE_TIMEOUT),
          headers: { Referer: "https://www.kuwo.cn/", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        }).then(function(res) {
          var list = res.data && res.data.abslist || [];
          var out = [];
          for (var i = 0; i < list.length; i++) {
            var it = list[i];
            var rid = String(it.MUSICRID || "").replace(/^MUSIC_/, "");
            if (!rid) continue;
            out.push({
              rid,
              title: String(it.NAME || it.SONGNAME || ""),
              artist: String(it.ARTIST || ""),
              duration: parseInt(it.DURATION, 10) || 0
            });
          }
          if (!out.length) throw new Error("kuwo search no rid");
          return out;
        });
      }
      function pickKuwoRid(musicItem, candidates) {
        var firstReason = "";
        for (var i = 0; i < candidates.length; i++) {
          var chk = kuwoSameTrackCheck(musicItem, candidates[i]);
          if (chk.ok) return candidates[i].rid;
          if (!firstReason) {
            firstReason = 'candidate#0 "' + candidates[i].title + " / " + candidates[i].artist + '": ' + chk.reason;
          }
        }
        throw new Error("kuwo same-track check failed (" + candidates.length + " candidates): " + firstReason);
      }
      function kuwoOfficialResolve(host, rid, quality, variant) {
        var br = KUWO_BR[quality] || KUWO_BR.standard;
        var params;
        if (variant === "car") {
          params = {
            f: "web",
            type: "convert_url_with_sign",
            br,
            rid,
            user: "C_APK_guanwang_" + Date.now(),
            source: "kwplayercar_ar_6.0.0.9_B_jiakong_vh.apk",
            from: "PC"
          };
        } else {
          params = {
            f: "web",
            type: "convert_url_with_sign",
            br,
            rid,
            user: 0,
            android_id: 0,
            prod: "kwplayerhd_ar_4.3.0.8",
            corp: "kuwo",
            vipver: "4.3.0.8",
            source: "kwplayerhd_ar_4.3.0.8_tianbao_T1A_qirui.apk",
            notrace: 0,
            sig: 0,
            priority: "bitrate",
            loginUid: 0,
            network: "WIFI",
            loginSid: 0,
            mode: "down"
          };
        }
        return axios.get("https://" + host + "/mobi.s", {
          params,
          timeout: chainSegTimeout(SOURCE_TIMEOUT),
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        }).then(function(res) {
          var d = res.data && res.data.data;
          if (!res.data || res.data.code !== 200 || !d || !d.url) throw new Error("kuwo official no url");
          if ((quality === "super" || quality === "hires") && d.format && d.format !== "flac") {
            throw new Error("kuwo official format degraded: " + d.format);
          }
          if (quality === "high" && d.format && d.format !== "mp3") {
            throw new Error("kuwo official high format degraded: " + d.format);
          }
          if (d.duration && d.duration > 0 && d.duration < 60) throw new Error("kuwo official trial snippet");
          var aq = d.format === "flac" ? "flac" : d.bitrate >= 320 ? "320k" : d.bitrate >= 192 ? "192k" : "128k";
          return { url: String(d.url), actualQuality: aq };
        });
      }
      function kuwoDesResolve(rid, quality, variant) {
        var fmt = quality === "super" || quality === "hires" ? "flac" : "mp3";
        var q;
        if (variant === "car") {
          q = "user=C_APK_guanwang_" + Date.now() + "&corp=kuwo&source=kwplayercar_ar_6.0.0.9_B_jiakong_vh.apk&p2p=1&type=convert_url2&sig=0&format=" + fmt + "&rid=" + rid;
        } else {
          q = "user=0&corp=kuwo&source=kwplayer_ar_5.1.0.0_B_jiakong_vh.apk&p2p=1&type=convert_url2&sig=0&format=" + fmt + "&rid=" + rid;
        }
        return axios.get("https://mobi.kuwo.cn/mobi.s", {
          params: { f: "kuwo", q: kuwoEncryptQuery(q, "ylzsxkwm") },
          timeout: chainSegTimeout(SOURCE_TIMEOUT),
          headers: { "User-Agent": "okhttp/3.10.0" }
        }).then(function(res) {
          var txt = typeof res.data === "string" ? res.data : String(res.data || "");
          var mUrl = txt.match(/(?:^|\n)url=([^\r\n]+)/);
          var mFmt = txt.match(/(?:^|\n)format=([^\r\n]+)/);
          var mBr = txt.match(/(?:^|\n)bitrate=([^\r\n]+)/);
          var url = mUrl ? String(mUrl[1]).trim() : "";
          if (!url || !/^http/i.test(url)) throw new Error("kuwo des no url");
          var fmtGot = mFmt ? String(mFmt[1]).trim() : "";
          if ((quality === "super" || quality === "hires") && fmtGot !== "flac") {
            throw new Error("kuwo des format mismatch: " + fmtGot);
          }
          var br = parseInt(mBr ? mBr[1] : "0", 10) || 0;
          if (quality === "high" && br > 0 && br < 320) throw new Error("kuwo des bitrate degraded: " + br);
          var aq;
          if (fmt === "flac") aq = "flac";
          else aq = br >= 320 ? "320k" : br >= 192 ? "192k" : "128k";
          return { url, actualQuality: aq };
        });
      }
      function resolveKuwoFallback(musicItem, quality) {
        var title = musicItem && (musicItem.title || musicItem.name) ? String(musicItem.title || musicItem.name) : "";
        var artist = musicItem && musicItem.artist ? String(musicItem.artist) : "";
        if (!title) return Promise.reject(new Error("kuwo fallback no keyword"));
        var q = artist ? title + " " + artist : title;
        var isLossless = quality === "super" || quality === "hires";
        return searchKuwoCandidates(q).then(function(candidates) {
          return pickKuwoRid(musicItem, candidates);
        }).then(function(rid) {
          var builds = isLossless ? [
            { delay: raceDelay(0), tag: "kuwo:des-std", build: function() {
              return kuwoDesResolve(rid, "super", "std");
            } },
            { delay: raceDelay(1), tag: "kuwo:des-car", build: function() {
              return kuwoDesResolve(rid, "super", "car");
            } },
            { delay: raceDelay(2), tag: "kuwo:official:nmobi", build: function() {
              return kuwoOfficialResolve("nmobi.kuwo.cn", rid, "super");
            } },
            { delay: raceDelay(3), tag: "kuwo:official:nmsublist", build: function() {
              return kuwoOfficialResolve("nmsublist.kuwo.cn", rid, "super");
            } },
            { delay: raceDelay(4), tag: "kuwo:official:mobi-car", build: function() {
              return kuwoOfficialResolve("mobi.kuwo.cn", rid, "super", "car");
            } }
          ] : [
            { delay: raceDelay(0), tag: "kuwo:official:nmobi", build: function() {
              return kuwoOfficialResolve("nmobi.kuwo.cn", rid, quality);
            } },
            { delay: raceDelay(1), tag: "kuwo:official:nmsublist", build: function() {
              return kuwoOfficialResolve("nmsublist.kuwo.cn", rid, quality);
            } },
            { delay: raceDelay(2), tag: "kuwo:official:mobi-car", build: function() {
              return kuwoOfficialResolve("mobi.kuwo.cn", rid, quality, "car");
            } }
          ];
          return racePriority(builds);
        }).then(function(r) {
          var u = /^http:\/\//i.test(r.url) ? r.url.replace(/^http:\/\//i, "https://") : r.url;
          return { url: u, actualQuality: r.actualQuality, channel: r.channel || "kuwo:official" };
        });
      }
      var H5V24_KEY = "Jk8qzuePiJ1qE3mDYhLQ3T73DtDoAhLP";
      var MIGU_FTP_PREFIX = "ftp://218.200.160.122:21/";
      var MIGU_HTTP_PREFIX = "https://freetyst.nf.migu.cn/";
      var MIGU_DIR_CN_PQ = "%E6%A0%87%E6%B8%85%E9%AB%98%E6%B8%85";
      var MIGU_DIR_CN_DL = "%E6%AD%8C%E6%9B%B2%E4%B8%8B%E8%BD%BD";
      function searchMiguCid(query) {
        return axios.get("https://pd.musicapp.migu.cn/MIGUM2.0/v1.0/content/search_all.do", {
          params: {
            ua: "Android_migu",
            version: "5.0.1",
            text: query,
            pageNo: 1,
            pageSize: 20,
            searchSwitch: '{"song":1,"album":0,"singer":0,"tagSong":0,"mvSong":0,"songlist":0,"bestShow":0}'
          },
          timeout: chainSegTimeout(SOURCE_TIMEOUT),
          headers: { Referer: "https://music.migu.cn/" }
        }).then(function(res) {
          var srd = res.data && res.data.songResultData;
          var list = srd && srd.result || [];
          for (var i = 0; i < list.length; i++) {
            var it = list[i];
            if (it && it.contentId && it.copyrightId) {
              return { contentId: String(it.contentId), copyrightId: String(it.copyrightId) };
            }
          }
          throw new Error("migu search no cid");
        });
      }
      function decryptH5v24(bytes) {
        if (bytes.length < 4) throw new Error("migu resp too short");
        if (bytes[0] !== 171 || bytes[1] !== 205 || bytes[2] !== 1) {
          throw new Error("migu magic mismatch");
        }
        var offset = bytes[3];
        var plain = new Array(bytes.length - 4);
        for (var i = 0; i < plain.length; i++) {
          var ki = H5V24_KEY.charCodeAt(i % 32);
          plain[i] = bytes[4 + i] + offset - ki & 255;
        }
        var out = "";
        for (var s = 0; s < plain.length; s += 4096) {
          out += String.fromCharCode.apply(String, plain.slice(s, s + 4096));
        }
        return JSON.parse(out);
      }
      function miguNormalizeUrl(u) {
        var s = String(u || "").replace(MIGU_FTP_PREFIX, MIGU_HTTP_PREFIX);
        return s.replace(/[^A-Za-z0-9\-._~:\/?#\[\]@!$&'()*+,;=%]/g, function(c) {
          return encodeURIComponent(c);
        });
      }
      function miguActualQuality(u) {
        var s = String(u || "");
        if (/wav_3d_60s/i.test(s)) return "atmos_plus";
        if (/wav_3d/i.test(s)) return "atmos";
        if (/wav_32bit/i.test(s)) return "hires";
        if (/flac_24bit/i.test(s)) return "flac24bit";
        if (/\.flac(\?|$)/i.test(s)) return "flac";
        if (/MP3_320/i.test(s)) return "320k";
        return "128k";
      }
      function deriveMiguUrl(pqUrl, quality) {
        if (quality === "standard" || String(pqUrl).indexOf("freetyst.nf.migu.cn") < 0) return pqUrl;
        if (quality === "high") {
          return pqUrl.replace("MP3_128_16_Stero", "MP3_320_16_Stero");
        }
        if (quality === "super") {
          return pqUrl.replace(MIGU_DIR_CN_PQ, MIGU_DIR_CN_DL).replace("MP3_128_16_Stero", "flac").replace(/\.mp3(\?|$)/, ".flac$1");
        }
        return pqUrl;
      }
      function miguProbeExists(url) {
        return axios.get(url, {
          timeout: chainSegTimeout(2500),
          headers: { Range: "bytes=0-0", Referer: "https://music.migu.cn/" },
          responseType: "arraybuffer"
        }).then(function(res) {
          if (res.status === 206) return true;
          if (res.status === 200 && !/text\/html/i.test(String(res.headers && (res.headers["content-type"] || res.headers["Content-Type"] || "")))) return true;
          throw new Error("migu probe http " + res.status);
        });
      }
      var MIGU_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
      function miguH5Resolve(miguRaw) {
        var url = "https://c.musicapp.migu.cn/strategy/listen-url/h5/v2.4?contentId=" + encodeURIComponent(miguRaw.contentId) + "&copyrightId=" + encodeURIComponent(miguRaw.copyrightId) + "&resourceType=2&netType=01&toneFlag=PQ&scene=&lowerQualityContentId=" + encodeURIComponent(miguRaw.contentId);
        return axios.get(url, {
          timeout: chainSegTimeout(SOURCE_TIMEOUT),
          responseType: "arraybuffer",
          headers: {
            birth: "h5page",
            channel: "014X031",
            Referer: "https://y.migu.cn/",
            "location-data": "30.6698676660,104.1229614820",
            "location-info": "",
            "User-Agent": MIGU_UA
          }
        }).then(function(res) {
          var data = decryptH5v24(new Uint8Array(res.data));
          if (!data || data.code !== "000000" || !data.data || !data.data.url) {
            throw new Error("migu h5 no url");
          }
          return miguNormalizeUrl(data.data.url);
        });
      }
      function miguAppResolve(miguRaw) {
        return axios.get("https://app.c.nf.migu.cn/MIGUM2.0/v2.1/content/listen-url", {
          params: { netType: "01", resourceType: "2", contentId: miguRaw.contentId, copyrightId: miguRaw.copyrightId, toneFlag: "PQ" },
          timeout: chainSegTimeout(SOURCE_TIMEOUT),
          headers: { channel: "0146832", version: "7.41.13", Referer: "https://app.c.nf.migu.cn/", "User-Agent": MIGU_UA }
        }).then(function(res) {
          var d = res.data && res.data.data;
          if (!d || !d.url) throw new Error("migu-app no url");
          return miguNormalizeUrl(d.url);
        });
      }
      function migu305Resolve(miguRaw) {
        return axios.get("https://c.musicapp.migu.cn/strategy/listen-song/v2.3", {
          params: { toneFlag: "PQ", copyrightId: miguRaw.copyrightId, contentId: miguRaw.contentId, resourceType: "2", channel: "0146921" },
          timeout: chainSegTimeout(SOURCE_TIMEOUT),
          maxRedirects: 0,
          validateStatus: null,
          headers: { "User-Agent": "okhttp/3.14.9", Referer: "https://music.migu.cn/" }
        }).then(function(res) {
          var loc = res.headers && (res.headers.location || res.headers.Location);
          if (res.status < 300 || res.status >= 400 || !loc) {
            throw new Error("migu-305 no redirect (status " + res.status + ")");
          }
          return miguNormalizeUrl(loc);
        });
      }
      var QQ_BAIMUSIC_URL = "http://106.55.0.102/baimusic/qqhoturl.php";
      var BK_K1 = [75, 114, 154, 243, 29, 136, 197, 7, 190, 52, 97, 170, 9, 85, 226, 124];
      var BK_K2 = [63, 145, 109, 4, 186, 39, 204, 88, 20, 249, 139, 224, 114, 74, 214, 1];
      var BK_DECKEY = [156, 78, 113, 178, 218, 56, 6, 245, 131, 204, 26, 71, 41, 232, 93, 191];
      var BK_HMAC_KEY = [90, 31, 142, 60, 183, 146, 100, 13, 250, 72, 21, 123, 227, 201, 42, 134];
      var BK_SBOX = function() {
        var std = [
          99,
          124,
          119,
          123,
          242,
          107,
          111,
          197,
          48,
          1,
          103,
          43,
          254,
          215,
          171,
          118,
          202,
          130,
          201,
          125,
          250,
          89,
          71,
          240,
          173,
          212,
          162,
          175,
          156,
          164,
          114,
          192,
          183,
          253,
          147,
          38,
          54,
          63,
          247,
          204,
          52,
          165,
          229,
          241,
          113,
          216,
          49,
          21,
          4,
          199,
          35,
          195,
          24,
          150,
          5,
          154,
          7,
          18,
          128,
          226,
          235,
          39,
          178,
          117,
          9,
          131,
          44,
          26,
          27,
          110,
          90,
          160,
          82,
          59,
          214,
          179,
          41,
          227,
          47,
          132,
          83,
          209,
          0,
          237,
          32,
          252,
          177,
          91,
          106,
          203,
          190,
          57,
          74,
          76,
          88,
          207,
          208,
          239,
          170,
          251,
          67,
          77,
          51,
          133,
          69,
          249,
          2,
          127,
          80,
          60,
          159,
          168,
          81,
          163,
          64,
          143,
          146,
          157,
          56,
          245,
          188,
          182,
          218,
          33,
          16,
          255,
          243,
          210,
          205,
          12,
          19,
          236,
          95,
          151,
          68,
          23,
          196,
          167,
          126,
          61,
          100,
          93,
          25,
          115,
          96,
          129,
          79,
          220,
          34,
          42,
          144,
          136,
          70,
          238,
          184,
          20,
          222,
          94,
          11,
          219,
          224,
          50,
          58,
          10,
          73,
          6,
          36,
          92,
          194,
          211,
          172,
          98,
          145,
          149,
          228,
          121,
          231,
          200,
          55,
          109,
          141,
          213,
          78,
          169,
          108,
          86,
          244,
          234,
          101,
          122,
          174,
          8,
          186,
          120,
          37,
          46,
          28,
          166,
          180,
          198,
          232,
          221,
          116,
          31,
          75,
          189,
          139,
          138,
          112,
          62,
          181,
          102,
          72,
          3,
          246,
          14,
          97,
          53,
          87,
          185,
          134,
          193,
          29,
          158,
          225,
          248,
          152,
          17,
          105,
          217,
          142,
          148,
          155,
          30,
          135,
          233,
          206,
          85,
          40,
          223,
          140,
          161,
          137,
          13,
          191,
          230,
          66,
          104,
          65,
          153,
          45,
          15,
          176,
          84,
          187,
          22
        ];
        var swaps = [[0, 99], [82, 120], [160, 224], [27, 212]];
        for (var i = 0; i < swaps.length; i++) {
          var a = swaps[i][0], b = swaps[i][1], t = std[a];
          std[a] = std[b];
          std[b] = t;
        }
        return std;
      }();
      var BK_SHA256_K = [
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ];
      function bkSha256(msgBytes) {
        function rotr(x, n) {
          return (x >>> n | x << 32 - n) >>> 0;
        }
        var H = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225];
        var len = msgBytes.length;
        var bitLenLo = len * 8 % 4294967296;
        var bitLenHi = Math.floor(len * 8 / 4294967296);
        var buf = [];
        for (var i = 0; i < len; i++) buf.push(msgBytes[i] & 255);
        buf.push(128);
        while (buf.length % 64 !== 56) buf.push(0);
        buf.push(bitLenHi >>> 24 & 255, bitLenHi >>> 16 & 255, bitLenHi >>> 8 & 255, bitLenHi & 255);
        buf.push(bitLenLo >>> 24 & 255, bitLenLo >>> 16 & 255, bitLenLo >>> 8 & 255, bitLenLo & 255);
        var w = new Array(64);
        for (var off = 0; off < buf.length; off += 64) {
          for (var t = 0; t < 16; t++) {
            w[t] = (buf[off + t * 4] << 24 | buf[off + t * 4 + 1] << 16 | buf[off + t * 4 + 2] << 8 | buf[off + t * 4 + 3]) >>> 0;
          }
          for (var t2 = 16; t2 < 64; t2++) {
            var s0 = rotr(w[t2 - 15], 7) ^ rotr(w[t2 - 15], 18) ^ w[t2 - 15] >>> 3;
            var s1 = rotr(w[t2 - 2], 17) ^ rotr(w[t2 - 2], 19) ^ w[t2 - 2] >>> 10;
            w[t2] = (w[t2 - 16] + s0 + w[t2 - 7] + s1) % 4294967296;
          }
          var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
          for (var t3 = 0; t3 < 64; t3++) {
            var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
            var ch = e & f ^ ~e & g;
            var temp1 = (h + S1 + ch + BK_SHA256_K[t3] + w[t3]) % 4294967296;
            var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
            var maj = a & b ^ a & c ^ b & c;
            var temp2 = (S0 + maj) % 4294967296;
            h = g;
            g = f;
            f = e;
            e = (d + temp1) % 4294967296;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) % 4294967296;
          }
          H[0] = (H[0] + a) % 4294967296;
          H[1] = (H[1] + b) % 4294967296;
          H[2] = (H[2] + c) % 4294967296;
          H[3] = (H[3] + d) % 4294967296;
          H[4] = (H[4] + e) % 4294967296;
          H[5] = (H[5] + f) % 4294967296;
          H[6] = (H[6] + g) % 4294967296;
          H[7] = (H[7] + h) % 4294967296;
        }
        var out = [];
        for (var k = 0; k < 8; k++) out.push(H[k] >>> 24 & 255, H[k] >>> 16 & 255, H[k] >>> 8 & 255, H[k] & 255);
        return out;
      }
      function bkHmacSha256Hex(keyBytes, msgBytes) {
        var BLK = 64;
        var k = keyBytes.slice();
        if (k.length > BLK) k = bkSha256(k);
        while (k.length < BLK) k.push(0);
        var oKey = [], iKey = [];
        for (var i = 0; i < BLK; i++) {
          oKey.push(k[i] ^ 92);
          iKey.push(k[i] ^ 54);
        }
        var inner = bkSha256(iKey.concat(msgBytes));
        var outer = bkSha256(oKey.concat(inner));
        var hex = "";
        for (var j = 0; j < outer.length; j++) hex += (outer[j] < 16 ? "0" : "") + outer[j].toString(16);
        return hex;
      }
      function bkB64Encode(bytes) {
        var out = "";
        for (var i = 0; i < bytes.length; i += 3) {
          var b0 = bytes[i] & 255;
          var has1 = i + 1 < bytes.length, has2 = i + 2 < bytes.length;
          var b1 = has1 ? bytes[i + 1] & 255 : 0;
          var b2 = has2 ? bytes[i + 2] & 255 : 0;
          out += B64_CHARS.charAt(b0 >> 2) + B64_CHARS.charAt((b0 & 3) << 4 | b1 >> 4);
          out += has1 ? B64_CHARS.charAt((b1 & 15) << 2 | b2 >> 6) : "=";
          out += has2 ? B64_CHARS.charAt(b2 & 63) : "=";
        }
        return out;
      }
      function bkB64Decode(b64) {
        var s = String(b64 || "").replace(/[\s=]+/g, "");
        var bytes = [], acc = 0, bits = 0;
        for (var i = 0; i < s.length; i++) {
          var v = B64_LOOKUP[s.charAt(i)];
          if (v === void 0) throw new Error("baimusic b64: invalid char " + s.charAt(i));
          acc = acc << 6 | v;
          bits += 6;
          if (bits >= 8) {
            bits -= 8;
            bytes.push(acc >> bits & 255);
          }
        }
        return bytes;
      }
      function bkBytesToUtf8(bytes) {
        var out = "", cp = 0, cont = 0, accCp = 0;
        for (var i = 0; i < bytes.length; i++) {
          var b = bytes[i] & 255;
          if (cont > 0) {
            accCp = accCp << 6 | b & 63;
            cont--;
            if (cont === 0) out += String.fromCodePoint ? String.fromCodePoint(accCp) : utf8CodePointToString(accCp);
          } else if (b < 128) {
            out += String.fromCharCode(b);
          } else if (b < 224) {
            cont = 1;
            accCp = b & 31;
          } else if (b < 240) {
            cont = 2;
            accCp = b & 15;
          } else {
            cont = 3;
            accCp = b & 7;
          }
        }
        return out;
      }
      function bkRc4(keyBytes, dataBytes) {
        var s = [];
        for (var i = 0; i < 256; i++) s[i] = i;
        var j = 0;
        for (var i2 = 0; i2 < 256; i2++) {
          j = j + s[i2] + keyBytes[i2 % keyBytes.length] & 255;
          var tt = s[i2];
          s[i2] = s[j];
          s[j] = tt;
        }
        var out = new Array(dataBytes.length);
        var ii = 0;
        j = 0;
        for (var k = 0; k < dataBytes.length; k++) {
          ii = ii + 1 & 255;
          j = j + s[ii] & 255;
          var t2 = s[ii];
          s[ii] = s[j];
          s[j] = t2;
          out[k] = dataBytes[k] & 255 ^ s[s[ii] + s[j] & 255];
        }
        return out;
      }
      function bkBlockEncrypt(plainStr) {
        var data = utf8Bytes(plainStr);
        var padLen = 16 - data.length % 16;
        var padByte = padLen ^ 90;
        var padded = data.slice();
        for (var p = 0; p < padLen; p++) padded.push(padByte);
        var key2 = BK_K2.slice();
        var out = [];
        var nBlocks = padded.length / 16;
        for (var blk = 0; blk < nBlocks; blk++) {
          var off = blk * 16;
          var state = new Array(16);
          for (var i = 0; i < 16; i++) state[i] = padded[off + i] & 255 ^ key2[i];
          for (var i2 = 0; i2 < 16; i2++) state[i2] = BK_SBOX[state[i2]];
          for (var i3 = 0; i3 < 16; i3++) state[i3] = state[i3] ^ BK_K1[i3];
          var blkOut = new Array(16);
          for (var row = 0; row < 4; row++) {
            for (var col = 0; col < 4; col++) {
              blkOut[row * 4 + col] = state[row * 4 + (col + row) % 4];
            }
          }
          for (var o = 0; o < 16; o++) out.push(blkOut[o]);
          key2 = blkOut;
        }
        return bkB64Encode(out);
      }
      function bkDecryptResp(dStr) {
        return bkBytesToUtf8(bkRc4(BK_DECKEY, bkB64Decode(dStr)));
      }
      function qqBaimusicEnabled() {
        return String(userVariablesSafe().qqBaimusic || "").toLowerCase() !== "off";
      }
      var BAIMUSIC_QUALITY_ALIAS = { hires: "flac24bit" };
      function resolveQqBaimusic(raw, hostQuality) {
        if (!qqBaimusicEnabled()) return Promise.reject(new Error("baimusic disabled"));
        var mid = raw && (raw.mid || raw.mediaMid) || "";
        if (!mid) return Promise.reject(new Error("baimusic: no mid"));
        var q = BAIMUSIC_QUALITY_ALIAS[String(hostQuality || "")] || String(hostQuality || "128k");
        var body = bkBlockEncrypt(JSON.stringify({ mid: String(mid), quality: q }));
        var sig = bkHmacSha256Hex(BK_HMAC_KEY, utf8Bytes(body));
        return axios.post(QQ_BAIMUSIC_URL, body, {
          timeout: chainSegTimeout(RELAY_TIMEOUT),
          headers: {
            "Content-Type": "application/octet-stream",
            "X-Sig": sig,
            "User-Agent": "Mozilla/5.0 (Linux; Android 15; V2453A) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.7390.5 Mobile Safari/537.36",
            "Accept": "*/*",
            "Accept-Language": "zh-CN,zh;q=0.9"
          },
          validateStatus: function(s) {
            return s >= 200 && s < 300;
          }
        }).then(function(res) {
          var j = res.data;
          if (typeof j === "string") {
            var t = j.trim();
            if (!t || t.charAt(0) !== "{") throw new Error("baimusic non-json response");
            j = JSON.parse(t);
          }
          if (!j || typeof j.d !== "string" || !j.d) throw new Error("baimusic: no d field");
          var plain = bkDecryptResp(j.d);
          var inner = JSON.parse(plain);
          if (inner && inner.error) throw new Error("baimusic: " + String(inner.error).slice(0, 80));
          var u = inner && inner.url;
          if (!u || !/^https?:\/\//i.test(String(u))) throw new Error("baimusic: no url in decrypted payload");
          if (inner.ekey) throw new Error("baimusic: ekey encrypted stream (fail-closed)");
          return { url: String(u), actualQuality: hostQualityToActual(hostQuality, q), channel: "qq:baimusic" };
        }).then(function(r) {
          return verifyQualitySize(r.url, hostQuality).then(function(vs) {
            r.size = vs && vs.total || 0;
            return r;
          });
        }).catch(function(e) {
          if (e instanceof SyntaxError) throw new Error("baimusic payload parse fail");
          throw e;
        });
      }
      function resolveMiguFallback(musicItem, quality) {
        var title = musicItem && (musicItem.title || musicItem.name) ? String(musicItem.title || musicItem.name) : "";
        var artist = musicItem && musicItem.artist ? String(musicItem.artist) : "";
        if (!title) return Promise.reject(new Error("migu fallback no keyword"));
        var q = artist ? title + " " + artist : title;
        return searchMiguCid(q).then(function(miguRaw) {
          return racePriority([
            { delay: raceDelay(0), build: function() {
              return miguH5Resolve(miguRaw);
            } },
            { delay: raceDelay(1), build: function() {
              return miguAppResolve(miguRaw);
            } },
            { delay: raceDelay(2), build: function() {
              return migu305Resolve(miguRaw);
            } }
          ]);
        }).then(function(pqUrl) {
          var url = deriveMiguUrl(pqUrl, quality);
          if (quality === "super") {
            return miguProbeExists(url).then(function() {
              return { url, actualQuality: "flac" };
            }, function() {
              var u2 = deriveMiguUrl(pqUrl, "high");
              return { url: u2, actualQuality: miguActualQuality(u2) };
            });
          }
          return { url, actualQuality: miguActualQuality(url) };
        }).then(function(r) {
          r.channel = "migu:official";
          return r;
        });
      }
      function resolveQq(raw, quality, musicItem, hostQuality) {
        var hq = hostQuality || (quality === "super" ? "flac" : quality === "high" ? "320k" : "128k");
        var haitangHedge = resolveHaitang("tx", raw.mid, quality);
        var kuwoHedge = resolveKuwoFallback(musicItem, quality);
        haitangHedge.catch(function() {
        });
        kuwoHedge.catch(function() {
        });
        var hiTier = quality === "master" ? "master" : quality === "hires" ? "hires" : hq === "flac24bit" ? "flac24bit" : null;
        if (hiTier) {
          var hiLaneAaaBuild = function() {
            return qqAaaCabEnabled() ? resolveQqAaaCab(raw, hiTier, musicItem) : Promise.reject(new Error("qqAaaCab \u5DF2\u5173\u95ED"));
          };
          var hiLaneHaitangBuild = function() {
            return haitangHedge;
          };
          var hiBuilds;
          if (hiTier === "master") {
            hiBuilds = [{ delay: raceDelay(0), tag: "qq:aaacab", build: hiLaneAaaBuild }];
          } else if (hiTier === "hires") {
            hiBuilds = [
              { delay: raceDelay(0), tag: "qq:aaacab", build: hiLaneAaaBuild },
              { delay: raceDelay(1), tag: "qq:haitang", build: hiLaneHaitangBuild }
            ];
          } else {
            hiBuilds = [
              { delay: raceDelay(0), tag: "qq:aaacab", build: hiLaneAaaBuild },
              { delay: raceDelay(1), tag: "qq:haitang", build: hiLaneHaitangBuild }
            ];
          }
          return racePriority(hiBuilds).catch(function() {
            return resolveQq(raw, "super", musicItem, "flac");
          });
        }
        function hedgeHaitang() {
          return haitangHedge;
        }
        function hedgeKuwo() {
          return kuwoHedge;
        }
        var qqVipFlag = musicItem && musicItem._src && musicItem._src.qq ? musicItem._src.qq.vip : void 0;
        var vipPreRoute = !!(musicItem && !qqCookieValue() && (qqVipFlag === 1 || musicItem.fee === 1));
        function qqSerialChain() {
          if (quality === "super" && raw.mediaMid && qqEvkeyEnabled() && !vipPreRoute) {
            var filename = "F0M0" + raw.mediaMid + ".mflac";
            var tryEv = function(hi) {
              if (hi >= QQ_EV_HOSTS.length) return Promise.reject(new Error("qq evkey all hosts failed"));
              return qqEvkeyRequest(QQ_EV_HOSTS[hi], raw, filename).catch(function() {
                return tryEv(hi + 1);
              });
            };
            return tryEv(0).catch(function() {
              return resolveQqPlainOfficial(raw, quality);
            }).catch(function() {
              return resolveQqUrlGetVkey(raw, quality);
            }).catch(function() {
              return resolveQqVkeys(raw, quality);
            }).catch(function() {
              return resolveQqS01s(raw, quality, musicItem);
            }).catch(function() {
              return hedgeHaitang();
            }).catch(function() {
              return resolveQqBugpk(raw, quality);
            }).catch(function() {
              return hedgeKuwo();
            }).catch(function() {
              return resolveMiguFallback(musicItem, quality);
            }).catch(function() {
              return qqBaimusicEnabled() ? resolveQqBaimusic(raw, hq) : Promise.reject(new Error("baimusic disabled"));
            });
          }
          var head = vipPreRoute ? Promise.reject(new Error("qq vip preroute: official segs skipped")) : resolveQqPlainOfficial(raw, quality);
          return head.catch(function() {
            return resolveQqUrlGetVkey(raw, quality);
          }).catch(function() {
            return resolveQqVkeysLegacy(raw, quality);
          }).catch(function() {
            return resolveQqVkeys(raw, quality);
          }).catch(function() {
            return resolveQqS01s(raw, quality, musicItem);
          }).catch(function() {
            return hedgeHaitang();
          }).catch(function() {
            return resolveQqBugpk(raw, quality);
          }).catch(function() {
            return resolveQqTinghui(raw, quality);
          }).catch(function() {
            if (quality === "high") return resolveQqCyapi(raw, quality);
            throw new Error("cyapi skipped: standard 96k downgrade removed in v1.3.6");
          }).catch(function() {
            return hedgeKuwo();
          }).catch(function() {
            return qqXunhuisiEnabled() ? resolveQqXunhuisi(raw, hq) : Promise.reject(new Error("xunhuisi disabled"));
          }).catch(function() {
            return resolveMiguFallback(musicItem, quality);
          }).catch(function() {
            return qqBaimusicEnabled() ? resolveQqBaimusic(raw, hq) : Promise.reject(new Error("baimusic disabled"));
          });
        }
        var changqingLane = function() {
          return resolveQqChangqing(raw, hq);
        };
        var s01sMidLane = function() {
          return qqS01sMidEnabled() ? resolveQqS01sMid(raw, hq) : Promise.reject(new Error("qqS01sMid \u5DF2\u5173\u95ED"));
        };
        var aaaCabLane = function() {
          return qqAaaCabEnabled() ? resolveQqAaaCab(raw, hq, musicItem) : Promise.reject(new Error("qqAaaCab \u5DF2\u5173\u95ED"));
        };
        return racePriority([
          { delay: raceDelay(0), tag: "qq:serial-chain", build: function() {
            return qqSerialChain();
          } },
          { delay: raceDelay(1), tag: "kuwo:official", build: function() {
            return kuwoHedge;
          } },
          { delay: raceDelay(2), tag: "qq:haitang", build: function() {
            return haitangHedge;
          } },
          { delay: raceDelay(3), tag: "qq:aaacab", build: aaaCabLane },
          { delay: raceDelay(4), tag: "qq:s01s-mid", build: s01sMidLane },
          { delay: raceDelay(5), tag: "qq:changqing", build: changqingLane }
        ]);
      }
      function resolveQqPlainOfficial(raw, quality) {
        var mid = raw && raw.mediaMid || raw && raw.mid || "";
        if (!quality || !mid) return Promise.reject(new Error("qq official batch: missing mid/mediaMid"));
        var filenames = QQ_BATCH_PREFIXES.map(function(p) {
          return p.prefix + mid + "." + p.ext;
        });
        var login = qqLoginState();
        var comm = { ct: 24, cv: 4747474, tmeAppID: "qqmusic", format: "json" };
        var param = {
          guid: randomGuid(),
          filename: filenames,
          songmid: [raw.mid],
          songtype: [0]
        };
        if (login) {
          comm.uin = login.uin;
          comm.qq = login.uin;
          comm.authst = login.authst;
          param.uin = login.uin;
          param.loginflag = 1;
          param.platform = "20";
        }
        var body = {
          comm,
          req_0: {
            module: "vkey.GetVkeyServer",
            method: "CgiGetVkey",
            param
          }
        };
        return axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", body, {
          timeout: chainSegTimeout(SOURCE_TIMEOUT),
          headers: qqCookieHeaders({
            "User-Agent": "HotDownloader/1.0",
            Referer: "https://y.qq.com/",
            "X-Forwarded-For": randomDomesticIP(),
            "Content-Type": "application/json"
          })
        }).then(function(res) {
          var d = res.data && res.data.req_0 && res.data.req_0.data;
          var list = d && d.midurlinfo || [];
          var sipPrefix = "https://wx.music.tc.qq.com/";
          var sip0 = d && d.sip && d.sip[0];
          if (sip0 && typeof sip0 === "string" && /^https?:\/\//i.test(sip0) && isAllowedMediaUrl(sip0)) {
            sipPrefix = sip0.charAt(sip0.length - 1) === "/" ? sip0 : sip0 + "/";
          }
          var byName = {};
          list.forEach(function(info) {
            if (info && info.filename) byName[String(info.filename)] = info;
          });
          for (var i = 0; i < QQ_BATCH_PREFIXES.length; i++) {
            var meta = QQ_BATCH_PREFIXES[i];
            if (meta.tiers.indexOf(quality) < 0) continue;
            var hit = byName[meta.prefix + mid + "." + meta.ext];
            if (hit && hit.purl) {
              return { url: sipPrefix + hit.purl, actualQuality: meta.aq, channel: "qq:official" };
            }
          }
          throw new Error("qq official no purl (batch 7 prefixes, " + quality + ")");
        });
      }
      var URLGETVKEY_FILE = { standard: "C400", high: "M800", super: "F000" };
      var URLGETVKEY_ACTUAL = { standard: "128k", high: "320k", super: "flac" };
      var URLGETVKEY_EXT = { standard: "m4a", high: "mp3", super: "flac" };
      function resolveQqUrlGetVkey(raw, quality) {
        var pfx = URLGETVKEY_FILE[quality];
        if (!pfx || !raw || !raw.mid) return Promise.reject(new Error("urlgetvkey unsupported quality"));
        var filename = pfx + raw.mid + "." + URLGETVKEY_EXT[quality];
        var body = {
          req_0: {
            module: "music.vkey.GetVkey",
            method: "UrlGetVkey",
            param: {
              guid: randomGuid(),
              songmid: [raw.mid],
              filename: [filename],
              uin: "0",
              loginflag: 0,
              platform: "20"
            }
          }
        };
        return axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", body, {
          timeout: chainSegTimeout(SOURCE_TIMEOUT),
          headers: qqCookieHeaders({
            "User-Agent": "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36",
            Referer: "https://y.qq.com/",
            "Content-Type": "application/json"
          })
        }).then(function(res) {
          var rd = res.data && res.data.req_0;
          var d = rd && rd.data;
          var info = d && d.midurlinfo && d.midurlinfo[0];
          var purl = info && info.purl;
          if (!purl) throw new Error("urlgetvkey no purl");
          var sip = d && d.sip && d.sip[0] || "http://aqqmusic.tc.qq.com/";
          return { url: String(sip) + String(purl), actualQuality: URLGETVKEY_ACTUAL[quality], channel: "qq:urlgetvkey" };
        });
      }
      var VKEYS_QQ_QUALITY = { standard: 6, high: 8, super: 10 };
      var VKEYS_QQ_ACTUAL = { 6: "128k", 8: "320k", 10: "flac" };
      function resolveQqVkeys(raw, quality) {
        var q = VKEYS_QQ_QUALITY[quality];
        if (!q || !raw || !raw.mid) return Promise.reject(new Error("vkeys unsupported quality"));
        return axios.get("https://api.vkeys.cn/v2/music/tencent/geturl", {
          params: { mid: raw.mid, quality: q },
          timeout: chainSegTimeout(RELAY_TIMEOUT),
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        }).then(function(res) {
          var body = res.data || {};
          if (body.code !== 200) throw new Error("vkeys code=" + body.code);
          var d = body.data || {};
          if (!d.url) throw new Error("vkeys no url");
          if (String(d.quality || "").indexOf("\u8BD5\u542C") >= 0) throw new Error("vkeys trial clip (VIP)");
          return { url: String(d.url), actualQuality: VKEYS_QQ_ACTUAL[q], channel: "qq:vkeys" };
        });
      }
      var VKEYS_LEGACY_QUALITY = { standard: 6, high: 8 };
      var VKEYS_LEGACY_ACTUAL = { 6: "128k", 8: "320k" };
      function resolveQqVkeysLegacy(raw, quality) {
        var q = VKEYS_LEGACY_QUALITY[quality];
        if (!q || !raw || !raw.mid) return Promise.reject(new Error("vkeys-legacy unsupported quality"));
        return axios.get("https://api.vkeys.cn/music/tencent/song/link", {
          params: { mid: raw.mid, quality: q },
          timeout: chainSegTimeout(RELAY_TIMEOUT),
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        }).then(function(res) {
          var body = res.data || {};
          if (body.code !== 0) throw new Error("vkeys-legacy code=" + body.code);
          var d = body.data || {};
          if (!d.url) throw new Error("vkeys-legacy no url");
          return { url: String(d.url), actualQuality: VKEYS_LEGACY_ACTUAL[q], channel: "qq:vkeys-legacy" };
        });
      }
      var TINGHUI_LEVEL = { standard: "standard", high: "exhigh" };
      var TINGHUI_ACTUAL = { standard: "128k", exhigh: "320k" };
      var TINGHUI_ATTEMPT_TIMEOUTS = [2e3, 1500, 1e3];
      var TINGHUI_BACKOFFS = [300, 600];
      var TINGHUI_RETRY_TOTAL = 3e3;
      function tinghuiIsRetryable(err) {
        if (!err) return false;
        if (err.response) {
          var s = err.response.status;
          return s === 502 || s === 503 || s === 504;
        }
        return true;
      }
      function resolveQqTinghui(raw, quality) {
        var lv = TINGHUI_LEVEL[quality];
        if (!lv || !raw || !raw.mid) return Promise.reject(new Error("tinghui unsupported quality"));
        var deadline = Date.now() + TINGHUI_RETRY_TOTAL;
        var attempt = function(i) {
          var remain = deadline - Date.now();
          if (remain <= 300) return Promise.reject(new Error("tinghui retry budget exhausted"));
          var to = Math.min(chainSegTimeout(TINGHUI_ATTEMPT_TIMEOUTS[i] || 1e3), remain);
          return axios.get("http://175.27.166.236/kgqq1/qq.php", {
            params: { level: lv, id: raw.mid },
            timeout: to,
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
          }).then(function(res) {
            var body = res.data || {};
            if (body.code !== 200) throw new Error("tinghui code=" + body.code);
            var d = body.data || {};
            var url = d.url;
            if (!url || typeof url !== "string" || url.indexOf("http") !== 0) {
              throw new Error("tinghui no url (" + String(d.error || body.msg || "").slice(0, 30) + ")");
            }
            if (url.indexOf("\u83B7\u53D6\u97F3\u9891\u5931\u8D25") >= 0) throw new Error("tinghui fake url (server error text)");
            return { url, actualQuality: TINGHUI_ACTUAL[lv], channel: "qq:tinghui" };
          }).catch(function(e) {
            if (i >= TINGHUI_ATTEMPT_TIMEOUTS.length - 1 || !tinghuiIsRetryable(e)) throw e;
            var delay = TINGHUI_BACKOFFS[Math.min(i, TINGHUI_BACKOFFS.length - 1)];
            return new Promise(function(resolve) {
              setTimeout(resolve, delay);
            }).then(function() {
              return attempt(i + 1);
            });
          });
        };
        return attempt(0);
      }
      var CYAPI_KEY = "1ffdf5733f5d538760e63d7e46ba17438d9f7b9dfc18c51be1109386fd74c3a1";
      function resolveQqCyapi(raw, quality) {
        if (!raw || !raw.mid) return Promise.reject(new Error("cyapi no mid"));
        var params = { apikey: CYAPI_KEY, type: "json", mid: raw.mid };
        var actual;
        if (quality === "high") {
          params.quality = "320";
          actual = "320k";
        } else if (quality === "standard") {
          actual = "96k";
        } else return Promise.reject(new Error("cyapi unsupported quality"));
        return axios.get("https://cyapi.top/API/qq_music.php", {
          params,
          timeout: chainSegTimeout(RELAY_TIMEOUT),
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        }).then(function(res) {
          var body = res.data || {};
          var url = body.url;
          if (!url || typeof url !== "string" || url.indexOf("http") !== 0) {
            throw new Error("cyapi no url");
          }
          return { url, actualQuality: actual, channel: "qq:cyapi" };
        });
      }
      var S01S_HOST = "https://tang.api.s01s.cn/";
      var S01S_FIELD_ORDER = {
        super: ["sq", "hq", "standard", "url", "fq"],
        high: ["standard", "hq", "url", "fq"],
        standard: ["standard", "url", "fq"]
      };
      var S01S_ACTUAL = { sq: "flac", hq: "320k", standard: "320k", url: "128k", fq: "128k" };
      function resolveQqS01s(raw, quality, musicItem) {
        if (!raw || !raw.mid) return Promise.reject(new Error("s01s no mid"));
        var kw = (musicItem && musicItem.title || "") + " " + (musicItem && musicItem.artist || "");
        if (!kw.trim()) return Promise.reject(new Error("s01s no keyword"));
        return axios.get(S01S_HOST, {
          // [v1.1.0 审查#14] limit 5→20：搜索一次拿更多候选，降低精确 mid 匹配失败率
          params: { name: kw, page: 1, limit: 20 },
          timeout: chainSegTimeout(RELAY_TIMEOUT),
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        }).then(function(res) {
          var body = res.data;
          if (typeof body === "string") {
            var t = body.trim();
            if (!t || t.charAt(0) !== "{") throw new Error("s01s non-json response");
            body = JSON.parse(t);
          }
          var list = body && (body.data || body.list || body.songs);
          if (typeof list === "string") list = JSON.parse(list);
          if (!list || !list.length) throw new Error("s01s empty list");
          var hit = null;
          for (var i = 0; i < list.length; i++) {
            if (list[i] && String(list[i].songmid || list[i].id) === String(raw.mid)) {
              hit = list[i];
              break;
            }
          }
          if (!hit) throw new Error("s01s no exact match");
          var order = S01S_FIELD_ORDER[quality] || S01S_FIELD_ORDER.standard;
          for (var fi = 0; fi < order.length; fi++) {
            var u = hit[order[fi]];
            if (u) return { url: String(u), actualQuality: S01S_ACTUAL[order[fi]], channel: "qq:s01s" };
          }
          throw new Error("s01s no url for quality " + quality);
        }).catch(function(e) {
          if (e instanceof SyntaxError) throw new Error("s01s parse fail");
          throw e;
        });
      }
      var RESOLVE_ADAPTERS = {
        qq: resolveQq
      };
      function pickCandidates(srcMap, quality) {
        var sources = [];
        for (var k in srcMap) {
          if (Object.prototype.hasOwnProperty.call(srcMap, k)) sources.push(k);
        }
        sources.sort(function(a, b) {
          var ca = canServe(a, quality) ? 0 : 1;
          var cb = canServe(b, quality) ? 0 : 1;
          if (ca !== cb) return ca - cb;
          return (SOURCE_WEIGHT[b] || 0.5) - (SOURCE_WEIGHT[a] || 0.5);
        });
        return sources;
      }
      var MEDIA_URL_HTTP_HOST_ALLOWLIST = [
        /\.qq\.com$/i
        // QQ 音乐流媒体（ws/isure.stream.qqmusic.qq.com 等）
        // [v1.1.0 fix#5] 移除 .kuwo.cn：酷我直链仅来自已剔除的听会 HTTP 裸 IP 段，白名单同步收口
      ];
      var RESOLVE_NEG_CACHE = {};
      var NEG_CACHE_TTL = 60 * 1e3;
      var NEG_CACHE_THRESHOLD = 2;
      function negCacheCheck(source, cacheKey) {
        var slot = RESOLVE_NEG_CACHE[cacheKey];
        if (!slot || !slot[source]) return false;
        var rec = slot[source];
        if (Date.now() > rec.until) {
          delete slot[source];
          return false;
        }
        return rec.fails >= NEG_CACHE_THRESHOLD;
      }
      function negCacheRecord(source, cacheKey) {
        var keys = Object.keys(RESOLVE_NEG_CACHE);
        if (keys.length > 200) RESOLVE_NEG_CACHE = {};
        if (!RESOLVE_NEG_CACHE[cacheKey]) RESOLVE_NEG_CACHE[cacheKey] = {};
        var rec = RESOLVE_NEG_CACHE[cacheKey][source] || { fails: 0, until: 0 };
        rec.fails += 1;
        rec.until = Date.now() + NEG_CACHE_TTL;
        RESOLVE_NEG_CACHE[cacheKey][source] = rec;
      }
      function isAllowedMediaUrl(url) {
        var s = String(url || "").trim();
        if (!/^https?:\/\//i.test(s)) return false;
        if (/^https:\/\//i.test(s)) return true;
        var m = /^https?:\/\/([^\/?#@\s]+)/i.exec(s);
        if (!m) return false;
        var host = m[1].toLowerCase().split(":")[0].split("@").pop();
        for (var i = 0; i < MEDIA_URL_HTTP_HOST_ALLOWLIST.length; i++) {
          if (MEDIA_URL_HTTP_HOST_ALLOWLIST[i].test(host)) return true;
        }
        return false;
      }
      function withTimeout(promise, ms, msg) {
        return new Promise(function(resolve, reject) {
          var settled = false;
          var timer = setTimeout(function() {
            if (!settled) {
              settled = true;
              reject(new Error(msg));
            }
          }, ms);
          promise.then(function(v) {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              resolve(v);
            }
          }, function(e) {
            if (!settled) {
              settled = true;
              clearTimeout(timer);
              reject(e || new Error(msg));
            }
          });
        });
      }
      function resolveWithFallback(musicItem, quality, hostQuality) {
        var srcMap = musicItem._src || {};
        var order = pickCandidates(srcMap, quality);
        var tries = order.slice(0, 3);
        var deadline = Date.now() + RESOLVE_BUDGET_MS;
        var chainToken = ++CHAIN_TOKEN;
        CHAIN_DEADLINE = deadline;
        var attempt = function(idx) {
          if (idx >= tries.length) {
            return Promise.reject(new Error("\u805A\u5408\u53D6\u94FE\u5931\u8D25\uFF1A\u6240\u6709\u53EF\u7528\u6E90\u5747\u672A\u53D6\u5F97\u64AD\u653E\u94FE\u63A5"));
          }
          var remain = deadline - Date.now();
          if (remain <= 500) {
            return Promise.reject(new Error("\u805A\u5408\u53D6\u94FE\u5931\u8D25\uFF1A\u8D85\u51FA\u5168\u5C40\u8D85\u65F6\u9884\u7B97 " + RESOLVE_BUDGET_MS + "ms"));
          }
          var source = tries[idx];
          var adapter = RESOLVE_ADAPTERS[source];
          if (!adapter) return attempt(idx + 1);
          var cacheKey = (musicItem && musicItem.id || srcMap[source] && srcMap[source].mid || "?") + "|" + quality;
          if (negCacheCheck(source, cacheKey)) return attempt(idx + 1);
          var segTimeout = idx === 0 ? remain : Math.min(remain, Math.max(1500, RELAY_TIMEOUT - (idx - 1) * 500));
          if (segTimeout > remain) segTimeout = remain;
          return withTimeout(adapter(srcMap[source], quality, musicItem, hostQuality), segTimeout, source + " \u53D6\u94FE\u8D85\u65F6 " + segTimeout + "ms").then(function(r) {
            if (r && !r.channel) r.channel = source;
            if (!isAllowedMediaUrl(r && r.url)) {
              throw new Error(source + " \u8FD4\u56DE URL \u672A\u901A\u8FC7\u534F\u8BAE/\u57DF\u540D\u6821\u9A8C");
            }
            var guardBudget = deadline - Date.now();
            if (guardBudget <= 500) throw new Error("\u805A\u5408\u53D6\u94FE\u5931\u8D25\uFF1A\u8D85\u51FA\u5168\u5C40\u8D85\u65F6\u9884\u7B97 " + RESOLVE_BUDGET_MS + "ms");
            if (guardBudget > SOURCE_TIMEOUT) guardBudget = SOURCE_TIMEOUT;
            return withTimeout(guardFullAudio(r.url, musicItem), guardBudget, "guard \u8D85\u65F6").then(function() {
              return r;
            });
          }).catch(function(e) {
            negCacheRecord(source, cacheKey);
            return attempt(idx + 1);
          });
        };
        return attempt(0).then(function(v) {
          if (CHAIN_TOKEN === chainToken) CHAIN_DEADLINE = 0;
          return v;
        }, function(e) {
          if (CHAIN_TOKEN === chainToken) CHAIN_DEADLINE = 0;
          throw e;
        });
      }
      function probeHeadSize(url, timeoutMs) {
        if (!url || typeof url !== "string") return Promise.resolve(0);
        var ms = Number(timeoutMs) > 0 ? Number(timeoutMs) : 2e3;
        return axios.get(url, {
          timeout: ms,
          headers: { Range: "bytes=0-0" },
          responseType: "arraybuffer",
          validateStatus: function(s) {
            return s >= 200 && s < 400;
          }
        }).then(function(res) {
          var headers = res.headers || {};
          var cr = headers["content-range"] || headers["Content-Range"];
          var mm = cr && String(cr).match(/\/(\d+)\s*$/);
          if (mm) return parseInt(mm[1], 10) || 0;
          if (res.status !== 206) {
            var cl = headers["content-length"] || headers["Content-Length"];
            return parseInt(cl, 10) || 0;
          }
          return 0;
        }).catch(function() {
          return 0;
        });
      }
      function guardFullAudio(url, musicItem) {
        return axios.get(url, {
          timeout: SOURCE_TIMEOUT,
          headers: { Range: "bytes=0-0" },
          responseType: "arraybuffer"
        }).then(function(res) {
          var headers = res.headers || {};
          var ctype = String(headers["content-type"] || headers["Content-Type"] || "");
          if (/text\/html/i.test(ctype)) {
            throw new Error("guard: not audio (html)");
          }
          var total = 0;
          var cr = headers["content-range"] || headers["Content-Range"];
          var mm = cr && String(cr).match(/\/(\d+)\s*$/);
          if (mm) {
            total = parseInt(mm[1], 10) || 0;
          } else if (res.status !== 206) {
            var cl = headers["content-length"] || headers["Content-Length"];
            total = parseInt(cl, 10) || 0;
          }
          var dur = musicItem && parseInt(musicItem.duration, 10) || 0;
          if (total > 0 && dur >= 60) {
            var est = total / 16e3;
            if (est < dur * 0.6) {
              throw new Error("guard: trial clip ~" + Math.round(est) + "s/" + dur + "s");
            }
          }
        }).catch(function(e) {
          if (e && /^guard:/.test(String(e && e.message))) throw e;
          if (e && e.response && e.response.status >= 400) {
            throw new Error("guard: probe http " + e.response.status);
          }
        });
      }
      var LYRIC_TIMEOUT = 3e3;
      var QRC_SBOXES = [
        [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7, 0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8, 4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0, 15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
        [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10, 3, 13, 4, 7, 15, 2, 8, 15, 12, 0, 1, 10, 6, 9, 11, 5, 0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15, 13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
        [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8, 13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1, 13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7, 1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
        [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15, 13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9, 10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4, 3, 15, 0, 6, 10, 10, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
        [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9, 14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6, 4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14, 11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
        [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11, 10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8, 9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6, 4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
        [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1, 13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6, 1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2, 6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
        [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7, 1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2, 7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8, 2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
      ];
      var QRC_PBOX = [16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10, 2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25];
      var QRC_EBOX = [32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17, 16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1];
      var QRC_KEY_SHIFT = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];
      var QRC_KEY_PERM_C = [56, 48, 40, 32, 24, 16, 8, 0, 57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35];
      var QRC_KEY_PERM_D = [62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 60, 52, 44, 36, 28, 20, 12, 4, 27, 19, 11, 3];
      var QRC_KEY_COMPRESSION = [13, 16, 10, 23, 0, 4, 2, 27, 14, 5, 20, 9, 22, 18, 11, 3, 25, 7, 15, 6, 26, 19, 12, 1, 40, 51, 30, 36, 46, 54, 29, 39, 50, 44, 32, 47, 43, 48, 38, 55, 33, 52, 45, 41, 49, 35, 28, 31];
      var QRC_IP_RULE = [34, 42, 50, 58, 2, 10, 18, 26, 36, 44, 52, 60, 4, 12, 20, 28, 38, 46, 54, 62, 6, 14, 22, 30, 40, 48, 56, 64, 8, 16, 24, 32, 33, 41, 49, 57, 1, 9, 17, 25, 35, 43, 51, 59, 3, 11, 19, 27, 37, 45, 53, 61, 5, 13, 21, 29, 39, 47, 55, 63, 7, 15, 23, 31];
      var QRC_INV_IP_RULE = [37, 5, 45, 13, 53, 21, 61, 29, 38, 6, 46, 14, 54, 22, 62, 30, 39, 7, 47, 15, 55, 23, 63, 31, 40, 8, 48, 16, 56, 24, 64, 32, 33, 1, 41, 9, 49, 17, 57, 25, 34, 2, 42, 10, 50, 18, 58, 26, 35, 3, 43, 11, 51, 19, 59, 27, 36, 4, 44, 12, 52, 20, 60, 28];
      function qrcUtf8Bytes(s) {
        var out = [];
        for (var i = 0; i < s.length; i++) {
          var cp = s.codePointAt(i);
          if (cp > 65535) i++;
          if (cp < 128) out.push(cp);
          else if (cp < 2048) out.push(192 | cp >> 6, 128 | cp & 63);
          else if (cp < 65536) out.push(224 | cp >> 12, 128 | cp >> 6 & 63, 128 | cp & 63);
          else out.push(240 | cp >> 18, 128 | cp >> 12 & 63, 128 | cp >> 6 & 63, 128 | cp & 63);
        }
        return Uint8Array.from(out);
      }
      function qrcUtf8Decode(bytes) {
        var out = "", i = 0, b, cp;
        while (i < bytes.length) {
          b = bytes[i];
          if (b < 128) {
            out += String.fromCharCode(b);
            i += 1;
          } else if (b < 224) {
            out += String.fromCharCode((b & 31) << 6 | bytes[i + 1] & 63);
            i += 2;
          } else if (b < 240) {
            out += String.fromCharCode((b & 15) << 12 | (bytes[i + 1] & 63) << 6 | bytes[i + 2] & 63);
            i += 3;
          } else {
            cp = (b & 7) << 18 | (bytes[i + 1] & 63) << 12 | (bytes[i + 2] & 63) << 6 | bytes[i + 3] & 63;
            cp -= 65536;
            out += String.fromCharCode(55296 + (cp >> 10), 56320 + (cp & 1023));
            i += 4;
          }
        }
        return out;
      }
      function qrcHexToBytes(hex) {
        var n = hex.length >> 1;
        var out = new Uint8Array(n);
        for (var i = 0; i < n; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
        return out;
      }
      var QRC_IP_LEFT = new Int32Array(2048);
      var QRC_IP_RIGHT = new Int32Array(2048);
      var QRC_INV_IP_LEFT = new Int32Array(2048);
      var QRC_INV_IP_RIGHT = new Int32Array(2048);
      function qrcPermByte(byteVal, bytePos, rule) {
        var left = 0, right = 0;
        for (var i = 0; i < 64; i++) {
          var q = rule[i] - 1;
          var local = q - bytePos * 8;
          if (local >= 0 && local < 8 && byteVal >> 7 - local & 1) {
            if (i < 32) left |= 1 << 31 - i;
            else right |= 1 << 63 - i;
          }
        }
        return [left, right];
      }
      (function qrcGenPermTables() {
        var gens = [[QRC_IP_RULE, QRC_IP_LEFT, QRC_IP_RIGHT], [QRC_INV_IP_RULE, QRC_INV_IP_LEFT, QRC_INV_IP_RIGHT]];
        for (var g = 0; g < gens.length; g++) {
          var rule = gens[g][0], tblL = gens[g][1], tblR = gens[g][2];
          for (var bytePos = 0; bytePos < 8; bytePos++) {
            for (var byteVal = 0; byteVal < 256; byteVal++) {
              var lr = qrcPermByte(byteVal, bytePos, rule);
              var idx = bytePos << 8 | byteVal;
              tblL[idx] = lr[0];
              tblR[idx] = lr[1];
            }
          }
        }
      })();
      var QRC_SP = new Int32Array(512);
      (function qrcGenSp() {
        for (var s = 0; s < 8; s++) {
          for (var inp = 0; inp < 64; inp++) {
            var idx = inp & 32 | (inp & 31) >> 1 | (inp & 1) << 4;
            var fourBit = QRC_SBOXES[s][idx];
            var preP = fourBit << 28 - s * 4;
            var out = 0;
            for (var i = 0; i < 32; i++) {
              var srcBit = QRC_PBOX[i];
              if ((preP & 1 << 32 - srcBit) !== 0) out |= 1 << 31 - i;
            }
            QRC_SP[s << 6 | inp] = out;
          }
        }
      })();
      var QRC_EBOX_HIGH = new Int32Array(1024);
      var QRC_EBOX_LOW = new Int32Array(1024);
      (function qrcGenEbox() {
        for (var chunk = 0; chunk < 4; chunk++) {
          var shift = (3 - chunk) * 8;
          for (var byteVal = 0; byteVal < 256; byteVal++) {
            var high24 = 0, low24 = 0;
            var input = byteVal << shift;
            for (var i = 0; i < 24; i++) {
              if (input >>> 32 - QRC_EBOX[i] & 1) high24 |= 1 << 23 - i;
            }
            for (var j = 24; j < 48; j++) {
              if (input >>> 32 - QRC_EBOX[j] & 1) low24 |= 1 << 47 - j;
            }
            var idx = chunk << 8 | byteVal;
            QRC_EBOX_HIGH[idx] = high24;
            QRC_EBOX_LOW[idx] = low24;
          }
        }
      })();
      function qrcPermuteFromKey(key, table) {
        var output = 0;
        var mask = 1 << table.length - 1;
        for (var i = 0; i < table.length; i++) {
          var pos = table[i];
          var wordIndex = pos >> 5;
          var bitInWord = pos & 31;
          var byteInWord = bitInWord >> 3;
          var bitInByte = bitInWord & 7;
          var byteIndex = wordIndex * 4 + 3 - byteInWord;
          if (key[byteIndex] >> 7 - bitInByte & 1) output |= mask;
          mask >>>= 1;
        }
        return output;
      }
      function qrcRotate28High(value, amount) {
        var v = value >>> 4 & 268435455;
        return ((v << amount | v >>> 28 - amount) & 268435455) << 4;
      }
      function qrcKeySchedule(key, decrypt) {
        var schedule = new Int32Array(32);
        var c = qrcPermuteFromKey(key, QRC_KEY_PERM_C) << 4;
        var d = qrcPermuteFromKey(key, QRC_KEY_PERM_D) << 4;
        for (var i = 0; i < 16; i++) {
          c = qrcRotate28High(c, QRC_KEY_SHIFT[i]);
          d = qrcRotate28High(d, QRC_KEY_SHIFT[i]);
          var toGen = decrypt ? 15 - i : i;
          var high24 = 0, low24 = 0;
          for (var k = 0; k < 48; k++) {
            var pos = QRC_KEY_COMPRESSION[k];
            var bit = pos < 28 ? c >>> 31 - pos & 1 : d >>> 31 - (pos - 27) & 1;
            if (bit) {
              if (k < 24) high24 |= 1 << 23 - k;
              else low24 |= 1 << 47 - k;
            }
          }
          schedule[toGen * 2] = high24;
          schedule[toGen * 2 + 1] = low24;
        }
        return schedule;
      }
      function qrcF(state, keyHigh24, keyLow24) {
        var b0 = state >>> 24 & 255;
        var b1 = state >>> 16 & 255;
        var b2 = state >>> 8 & 255;
        var b3 = state & 255;
        var eHigh = QRC_EBOX_HIGH[b0] | QRC_EBOX_HIGH[256 | b1] | QRC_EBOX_HIGH[512 | b2] | QRC_EBOX_HIGH[768 | b3];
        var eLow = QRC_EBOX_LOW[b0] | QRC_EBOX_LOW[256 | b1] | QRC_EBOX_LOW[512 | b2] | QRC_EBOX_LOW[768 | b3];
        var xh = eHigh ^ keyHigh24;
        var xl = eLow ^ keyLow24;
        return QRC_SP[xh >>> 18 & 63] | QRC_SP[64 | xh >>> 12 & 63] | QRC_SP[128 | xh >>> 6 & 63] | QRC_SP[192 | xh & 63] | QRC_SP[256 | xl >>> 18 & 63] | QRC_SP[320 | xl >>> 12 & 63] | QRC_SP[384 | xl >>> 6 & 63] | QRC_SP[448 | xl & 63];
      }
      function qrcDesCrypt(input, inputOff, output, outputOff, schedule) {
        var left = 0, right = 0;
        for (var i = 0; i < 8; i++) {
          var idx = i << 8 | input[inputOff + i];
          left |= QRC_IP_LEFT[idx];
          right |= QRC_IP_RIGHT[idx];
        }
        for (var r = 0; r < 15; r++) {
          var temp = right;
          right = (left ^ qrcF(right, schedule[r * 2], schedule[r * 2 + 1])) >>> 0;
          left = temp;
        }
        left = (left ^ qrcF(right, schedule[30], schedule[31])) >>> 0;
        var outLeft = 0, outRight = 0;
        for (var m = 0; m < 4; m++) {
          var idxL = m << 8 | left >>> 24 - m * 8 & 255;
          outLeft |= QRC_INV_IP_LEFT[idxL];
          outRight |= QRC_INV_IP_RIGHT[idxL];
          var idxR = m + 4 << 8 | right >>> 24 - m * 8 & 255;
          outLeft |= QRC_INV_IP_LEFT[idxR];
          outRight |= QRC_INV_IP_RIGHT[idxR];
        }
        output[outputOff] = outLeft >>> 24 & 255;
        output[outputOff + 1] = outLeft >>> 16 & 255;
        output[outputOff + 2] = outLeft >>> 8 & 255;
        output[outputOff + 3] = outLeft & 255;
        output[outputOff + 4] = outRight >>> 24 & 255;
        output[outputOff + 5] = outRight >>> 16 & 255;
        output[outputOff + 6] = outRight >>> 8 & 255;
        output[outputOff + 7] = outRight & 255;
      }
      var QRC_KEY_1 = qrcUtf8Bytes("!@#)(*$%");
      var QRC_KEY_2 = qrcUtf8Bytes("123ZXC!@");
      var QRC_KEY_3 = qrcUtf8Bytes("!@#)(NHL");
      var QRC_DECRYPT_SCHEDULES = [
        qrcKeySchedule(QRC_KEY_3, true),
        qrcKeySchedule(QRC_KEY_2, false),
        qrcKeySchedule(QRC_KEY_1, true)
      ];
      function qrcDecryptBlock(input, inOff, output, outOff) {
        var t1 = new Uint8Array(8);
        var t2 = new Uint8Array(8);
        qrcDesCrypt(input, inOff, t1, 0, QRC_DECRYPT_SCHEDULES[0]);
        qrcDesCrypt(t1, 0, t2, 0, QRC_DECRYPT_SCHEDULES[1]);
        qrcDesCrypt(t2, 0, output, outOff, QRC_DECRYPT_SCHEDULES[2]);
      }
      function qrcDecryptHex(hex, inflateFn) {
        var enc = qrcHexToBytes(hex);
        if (enc.length % 8 !== 0) throw new Error("qrc: \u5BC6\u6587\u957F\u5EA6\u4E0D\u662F 8 \u7684\u500D\u6570");
        var dec = new Uint8Array(enc.length);
        for (var i = 0; i < enc.length; i += 8) qrcDecryptBlock(enc, i, dec, i);
        var raw = inflateFn(dec);
        if (raw.length >= 3 && raw[0] === 239 && raw[1] === 187 && raw[2] === 191) raw = raw.slice(3);
        return qrcUtf8Decode(raw);
      }
      async function fetchQqQrc(mid) {
        if (!mid) throw new Error("qrc no mid");
        var pako = require_pako();
        var r = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
          comm: { ct: "24", cv: "0" },
          req: {
            module: "music.musichallSong.PlayLyricInfo",
            method: "GetPlayLyricInfo",
            param: { crypt: 1, qrc: 1, trans: 1, type: 1, songMid: String(mid) }
          }
        }, {
          timeout: LYRIC_TIMEOUT,
          headers: qqCookieHeaders({ "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", Referer: "https://y.qq.com/", "Content-Type": "application/json" })
        });
        var d = r.data && r.data.req && r.data.req.data;
        var hex = d && d.lyric || d && d.qrc && (d.qrc.qrcCypherContent || d.qrc.content);
        if (!hex) throw new Error("qrc api no cypher content (retcode=" + (d && d.retcode) + ")");
        var text = qrcDecryptHex(String(hex), pako.inflate);
        var m = text.match(/LyricContent="([\s\S]*?)"\s*\/?>/);
        var content = m ? m[1] : text;
        content = content.replace(/&#10;/g, "\n").replace(/&#13;/g, "").replace(/&#9;/g, "	").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
        if (!/\[\d+,\d+\]/.test(content)) throw new Error("qrc not word-by-word");
        return content;
      }
      async function fetchQqQrcRelay(item) {
        var kw = (item && item.title || "") + " " + (item && item.artist || "");
        if (!kw.trim()) throw new Error("qrc relay no keyword");
        var r = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
          comm: { ct: "24", cv: "0" },
          req: {
            module: "music.adaptor.SearchAdaptor",
            method: "do_search_v2",
            param: { query: kw, search_type: 0, page_num: 1, num_per_page: 8 }
          }
        }, {
          timeout: LYRIC_TIMEOUT,
          headers: qqCookieHeaders({ "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", Referer: "https://y.qq.com/", "Content-Type": "application/json" })
        });
        var reqData = r.data && r.data.req && r.data.req.data;
        var items = (((reqData || {}).body || {}).item_song || {}).items || [];
        var dur = parseInt(item && item.duration, 10) || 0;
        var hit = null;
        for (var i = 0; i < items.length; i++) {
          var d = parseInt(items[i].interval, 10) || 0;
          if (dur > 0 && d > 0 && Math.abs(d - dur) > 6) continue;
          hit = items[i];
          break;
        }
        if (!hit && items.length) hit = items[0];
        if (!hit || !hit.mid) throw new Error("qrc relay no match");
        return fetchQqQrc(String(hit.mid));
      }
      async function getWordByWordLyricImpl(musicItem) {
        if (!musicItem || !musicItem._src) throw new Error("\u8BE5\u6761\u76EE\u65E0\u97F3\u6E90\u4FE1\u606F\uFF0C\u65E0\u6CD5\u53D6\u9010\u5B57\u6B4C\u8BCD");
        var srcMap = musicItem._src;
        var tried = [];
        if (srcMap.qq && srcMap.qq.mid) {
          try {
            return await fetchQqQrc(srcMap.qq.mid);
          } catch (e) {
            tried.push("qq: " + String(e && e.message).slice(0, 50));
          }
        }
        try {
          return await fetchQqQrcRelay(musicItem);
        } catch (e) {
          tried.push("qq-relay: " + String(e && e.message).slice(0, 50));
        }
        throw new Error("\u9010\u5B57\u6B4C\u8BCD\u4E0D\u53EF\u7528\uFF08" + tried.join(" | ") + "\uFF09");
      }
      function normalizeColonTimeTag(lrc) {
        if (!lrc) return lrc;
        return String(lrc).replace(/\[(\d+):([0-5]?\d):(\d{1,3})\]/g, function(_, min, sec, frac) {
          var ms = frac.length === 1 ? frac + "00" : frac.length === 2 ? frac + "0" : frac.slice(0, 3);
          return "[" + min + ":" + sec + "." + ms + "]";
        });
      }
      async function fetchQqRomaLrc(mid) {
        if (!mid) throw new Error("roma no mid");
        var pako = require_pako();
        var r = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
          comm: { ct: "24", cv: "0", guid: "10000", uin: "0" },
          req: {
            module: "music.musichallSong.PlayLyricInfo",
            method: "GetPlayLyricInfo",
            param: {
              crypt: 1,
              lrc_t: 0,
              qrc: 1,
              qrc_t: 0,
              roma: 1,
              roma_t: 0,
              trans: 1,
              trans_t: 0,
              needSingingAnnotations: false,
              type: 1,
              songMid: String(mid)
            }
          }
        }, {
          timeout: LYRIC_TIMEOUT,
          headers: qqCookieHeaders({ "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", Referer: "https://y.qq.com/", "Content-Type": "application/json" })
        });
        var d = r.data && r.data.req && r.data.req.data;
        var hex = d && d.roma;
        if (!hex) throw new Error("roma api no content");
        var text = qrcDecryptHex(String(hex), pako.inflate);
        var m = text.match(/LyricContent="([\s\S]*?)"\s*\/?>/);
        var content = m ? m[1] : text;
        content = content.replace(/&#10;/g, "\n").replace(/&#13;/g, "").replace(/&#9;/g, "	").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
        var lines = content.split("\n");
        var out = [];
        for (var i = 0; i < lines.length; i++) {
          var ln = lines[i];
          if (!ln) continue;
          if (!/^\[\d+,\d+\]/.test(ln)) {
            out.push(ln);
            continue;
          }
          var head = /^\[(\d+),\d+\]/.exec(ln);
          var words = ln.replace(/^\[\d+,\d+\]/, "").replace(/\(\d+,\d+\)/g, "").trim();
          if (!words) continue;
          var ms = parseInt(head[1], 10) || 0;
          var mm = Math.floor(ms / 6e4);
          var ss = Math.floor(ms % 6e4 / 1e3);
          var mmm = ms % 1e3;
          out.push("[" + mm + ":" + (ss < 10 ? "0" : "") + ss + "." + (mmm < 10 ? "00" : mmm < 100 ? "0" : "") + mmm + "]" + words);
        }
        if (!out.length) throw new Error("roma empty");
        return out.join("\n");
      }
      var LYRIC_ADAPTERS = {
        qq: async function(raw) {
          if (!raw || !raw.mid) throw new Error("qq no mid");
          var romaP = fetchQqRomaLrc(String(raw.mid)).catch(function() {
            return null;
          });
          var r = await axios.get("https://c.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg", {
            params: {
              g_tk: 5381,
              format: "json",
              inCharset: "utf-8",
              outCharset: "utf-8",
              notice: 0,
              platform: "h5",
              needNewCode: 1,
              ct: 121,
              cv: 0,
              nobase64: 1,
              songmid: raw.mid
            },
            timeout: SOURCE_TIMEOUT,
            headers: { Referer: "https://y.qq.com/portal/player.html", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
          });
          var lrc = r.data && r.data.lyric;
          if (!lrc) throw new Error("qq no lyric");
          var out = { rawLrc: normalizeColonTimeTag(String(lrc)) };
          var t = r.data && r.data.trans;
          if (t) {
            try {
              out.translation = normalizeColonTimeTag(b64DecodeUtf8(String(t)));
            } catch (e) {
            }
          }
          var roma = await romaP;
          if (roma) {
            out.romanization = roma;
            out.romaLrc = roma;
          }
          return out;
        }
      };
      var B64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var B64_LOOKUP = function() {
        var m = {};
        for (var i = 0; i < B64_CHARS.length; i++) m[B64_CHARS.charAt(i)] = i;
        m["-"] = 62;
        m["_"] = 63;
        return m;
      }();
      function b64DecodeUtf8(b64) {
        var s = String(b64 || "").replace(/[\s=]+/g, "");
        var bytes = [];
        var acc = 0, bits = 0;
        for (var i = 0; i < s.length; i++) {
          var v = B64_LOOKUP[s.charAt(i)];
          if (v === void 0) throw new Error("invalid base64 char: " + s.charAt(i));
          acc = acc << 6 | v;
          bits += 6;
          if (bits >= 8) {
            bits -= 8;
            bytes.push(acc >> bits & 255);
          }
        }
        var out = "", cp = 0, cont = 0, accCp = 0;
        for (var j = 0; j < bytes.length; j++) {
          var b = bytes[j];
          if (cont > 0) {
            accCp = accCp << 6 | b & 63;
            cont--;
            if (cont === 0) {
              out += String.fromCodePoint ? String.fromCodePoint(accCp) : utf8CodePointToString(accCp);
            }
          } else if (b < 128) {
            out += String.fromCharCode(b);
          } else if (b < 224) {
            cont = 1;
            accCp = b & 31;
          } else if (b < 240) {
            cont = 2;
            accCp = b & 15;
          } else {
            cont = 3;
            accCp = b & 7;
          }
        }
        return out;
      }
      function utf8CodePointToString(cp) {
        if (cp >= 65536) {
          cp -= 65536;
          return String.fromCharCode(55296 + (cp >> 10), 56320 + (cp & 1023));
        }
        return String.fromCharCode(cp);
      }
      var LYRIC_SOURCE_ORDER = ["qq"];
      async function getLyricImpl(musicItem) {
        if (!musicItem || !musicItem._src) throw new Error("\u8BE5\u6761\u76EE\u65E0\u97F3\u6E90\u4FE1\u606F\uFF0C\u65E0\u6CD5\u53D6\u6B4C\u8BCD");
        var srcMap = musicItem._src;
        var tried = [];
        var order = [];
        if (musicItem._srcOrder) {
          for (var s0 = 0; s0 < musicItem._srcOrder.length; s0++) order.push(musicItem._srcOrder[s0]);
        }
        for (var oi = 0; oi < LYRIC_SOURCE_ORDER.length; oi++) {
          if (order.indexOf(LYRIC_SOURCE_ORDER[oi]) < 0) order.push(LYRIC_SOURCE_ORDER[oi]);
        }
        var maxAttempts = 3;
        var attempted = 0;
        for (var i = 0; i < order.length && attempted < maxAttempts; i++) {
          var src = order[i];
          if (!srcMap[src] || !LYRIC_ADAPTERS[src]) continue;
          attempted++;
          try {
            return await LYRIC_ADAPTERS[src](srcMap[src], musicItem);
          } catch (e) {
            tried.push(src + ": " + String(e && e.message).slice(0, 60));
          }
        }
        throw new Error("\u6240\u6709\u97F3\u6E90\u6B4C\u8BCD\u5747\u4E0D\u53EF\u7528\uFF08" + tried.join(" | ") + "\uFF09");
      }
      var plugin = {
        srcUrl: "https://raw.githubusercontent.com/hebijunge/musicfree-plugins/master/plugins/qq-source.plugin.v1.9.26.js",
        name: "QQ\u97F3\u4E50",
        platform: "qq",
        version: "1.9.26",
        // [v1.9.25 未消费对冲 rejection 兜底版（2026-10-23，任务 7699658602860039409，承接 10-23 每日日报风险项）：v1.9.23 高档专属链（master/hires/flac24bit 命中即提前 return）使 resolveQq 入口共享在途对冲 promise（haitangHedge/kuwoHedge）在该分支失去下游消费者——master 分支两个均无消费、hires/flac24bit 分支 kuwoHedge 无消费；对冲失败属竞速让路正常路径（酷我同曲校验不过/搜索失败、海棠 404 fail-closed 等），但无 handler 的 rejection 会以 unhandledRejection 打扰宿主进程；修复为两 hedge 创建后旁路挂 no-op catch（Promise 多 handler 语义，已消费时无副作用、未消费时静默吸收），只加异常兜底，取链逻辑/音质档位行为/跨源降级优先级零变化；详见头部 changelog；v1.9.20 瓜子中转通道移除版（2026-10-11 每日检测）：api.guazi.fun/lx 连续 3 日 403「Key 无效或已被删除」且无可用新 key，resolveQqGuazi 调用项（原第 7 路 guaziLane）自 kuwoRaceSuccess 竞速池移除 7→6 路（守卫与 fail-closed 逻辑保留），其余通道与优先级零变化；详见头部 changelog；v1.9.18 专辑分页健壮性收口版（对齐 baka 语义）：主路/副路翻页新增空页提前结束检测（总数已知时空页抛错，不静默交付不完整专辑）+ 重复页签名检测（同页重复返回抛错防死循环），移除不满页即 break 行为，详见头部 changelog；v1.9.17 瓜子中转 tx 通道吸收版（新增 guazi 竞速第 7 路，实测 master→192kHz 母带，userVariables.qqGuazi 默认开）；v1.9.15 v1.9.15 接口吸收版（承接「23 个音乐插件可吸收取链接口」调研，实测存活口径 2026-09-25）：新增 xunhuisi QQ vkey 直链兜底（api.xunhuisi.store/API/QQMusic/Song.php?mid=，探针实测 isure6.stream.qqmusic.qq.com 官方 stream C600 m4a 320k 6.52MB ftyp 可播）——该通道恒返单一 320k m4a 档，仅 standard/high 链尾启用（酷我兜底之后、咪咕二级兜底之前），super 等无损请求跳过避免静默降级；userVariables.qqXunhuisi 默认开（off 关闭）；自带 ftyp 兼容校验 verifyM4aQualitySize（既有 verifyQualitySize 不认 ftyp 魔数，m4a 会被误拒）；详见头部 changelog；；v1.9.14 包升版（网易源集成长青 SVIP 网易替补通道 yinyue.haitangw.net，本源无代码改动，随包升版）；v1.9.13 a.aa.cab/qq.music 虚标修复版（方案A·拒绝虚标）：2026-09-21 每日检查实测该端点对高音质/未知音质码一律回落 C400 HQ m4a 虚标（12 种 type 实测均然，违背「请求哪个音质就获取哪个音质」总原则）；修复三件套：①音质准入白名单 flac/flac24bit/lossless/hires/master/atmos/atmos_51/jymaster/dolby/super 入口即拒绝（不发请求），仅 ≤320k 参与竞速；②双守门 fail-closed——music URL 路径前缀识别实档（M500/C400=128k、M800=320k，未知前缀拒绝）+ tips fail-closed（未知 tips 一律拒绝，堵住 v1.9.12「未知 tips 跳过守门」漏过的「HQ 高品质」虚标）；③actualQuality 以前缀实档为准宁低勿高；详见头部 changelog；v1.9.12 a.aa.cab/qq.music 搜索型取链通道接入版（替换 v1.9.4 已禁用的旧 HelloWorld 通道，歌曲匹配+音质大小校验，userVariables.qqAaaCab 默认开，详见头部 changelog）；v1.9.11 星澜 stellarwave tx 通道核查版（无代码增量，版本号统一升）：星澜 43 后端池中 QQ 相关后端 2026-09-12 逐个真网复测全部失效（星海 403 认证墙/317ak 403/ygking 路径失效/念心 404/FishAPI 空响应/FFAPI 官宣关闭/QQ越权密钥失效/HYW 空响应/HelloWorld 已死/QQ官方与vkeys 同源无增量），按「只接实测可用」原则零通道接入、竞速池与取链行为零变化，详见头部 changelog；v1.9.10 随包升版（无代码改动，版本号统一升）；v1.9.9 音质标识一致性核查版（无代码行为改动，版本号统一升）：搜索/榜单/歌单/专辑/歌手/导入六页键集核查 0 虚标 0 不一致，取链真实性实测 6/6 通过（128k/320k/flac 实档与声明一致），详见排查总表-v1.9.9；v1.9.8版本号统一版（各源版本号对齐，无代码增量）；v1.9.5 全页面音质标识核查 + VIP 标识移除版：榜单聚合条目补 qualities 音质表透传（榜单页此前无音质标识）；全接口停写 fee（VIP 角标）字段、getMusicInfo 不再回填，VIP 语义改存 _src.qq.vip 内部字段仅供取链 vipPreRoute 预判，宿主不渲染；旧缓存条目向下兼容；v1.9.4 第三方取链修复 + size 字段版：5 路第三方探针实测 → 失效两通道（Hello World 2026-09-11 改版为云汐 API 主页、念心 2026-09-11 404 站点下线）保留函数体注释从竞速池移除；s01s-mid 扩档（pq 24bit/accom Atmos 直读 song_size_X_str 写回 size）+ 长青守门（仅 128k、解析响应 quality/size 字段）+ 海棠补 Range 0-0 HEAD 探测 size；getMediaSource 返回值补 size 字段（取链直带 > HEAD 探测 > 留空）；详见头部 changelog；v1.9.1 随包升版：歌单对象补 author 别名字段（宿主协议读 artist，任务字段清单要求 author，两者都传），导入修复详见酷狗 v1.9.1 changelog 与本轮自测清单；v1.9.0 BakaMusic 高价值音源接入版：P0 次合代 s01s mid 直查通道（resolveQqS01sMid，免搜索精确命中，sq 实测真 FLAC ~1647kbps）加入第三方竞速 6→7 路，userVariables.qqS01sMid 默认开；ikun QQ 通道无卡密假成功不接入；详见头部 changelog；v1.8.4] 歌单导入元数据版：importMusicSheet 返回完整 IMusicSheetItem（title/description 对齐宿主契约，meta 随 CgiGetDiss dirinfo 零额外请求回传）；[v1.8.3] 质检遗留优化版（Q-02/Q-03 复核确认已符合统一口径，随包升版）；2026-09-10 歌单解析修复版（SHEET_URL_RESOLVERS 补 playlistDetail/<id> + P2-4 错误码统一，详见头部 v1.8.2 changelog）
        primaryKey: ["id"],
        // [v1.5.0 P2] 插件级声明（宿主 pluginManager 存档约定，对齐网易云/咪咕）
        author: "\u7814\u53D12\u53F7",
        description: 'QQ\u97F3\u4E50\u72EC\u7ACB\u6E90\u63D2\u4EF6 v1.9.13\uFF08v1.9.13 a.aa.cab/qq.music \u865A\u6807\u4FEE\u590D\u7248\xB7\u65B9\u6848A\uFF1A\u8BE5\u7AEF\u70B9\u5BF9\u9AD8\u97F3\u8D28/\u672A\u77E5\u97F3\u8D28\u7801\u4E00\u5F8B\u56DE\u843D C400 HQ m4a \u865A\u6807\uFF0C\u5DF2\u52A0\u97F3\u8D28\u51C6\u5165\u767D\u540D\u5355\uFF08\u4EC5 \u2264320k \u53C2\u4E0E\u7ADE\u901F\uFF0C\u9AD8\u97F3\u8D28\u5165\u53E3\u5373\u62D2\u7EDD\uFF09+ \u8DEF\u5F84\u524D\u7F00/tips \u53CC\u5B88\u95E8 fail-closed\uFF0CactualQuality \u4EE5\u524D\u7F00\u5B9E\u6863\u4E3A\u51C6\uFF1Bv1.9.8 \u7248\u672C\u53F7\u7EDF\u4E00\u7248\uFF1A\u5404\u6E90\u7248\u672C\u53F7\u5BF9\u9F50\uFF0C\u65E0\u4EE3\u7801\u589E\u91CF\uFF1B\u5168\u9875\u9762\u97F3\u8D28\u6807\u8BC6\u6838\u67E5 + VIP \u6807\u8BC6\u79FB\u9664\u7248\uFF1A\u699C\u5355\u805A\u5408\u6761\u76EE\u8865 qualities \u97F3\u8D28\u8868\u900F\u4F20\uFF1B\u5168\u63A5\u53E3\u505C\u5199 fee\uFF08VIP \u89D2\u6807\uFF09\uFF0CVIP \u8BED\u4E49\u6539\u5B58 _src.qq.vip \u5185\u90E8\u5B57\u6BB5\u4EC5\u4F9B\u53D6\u94FE\u9884\u5224\uFF1Bv1.9.4 \u7B2C\u4E09\u65B9\u53D6\u94FE\u4FEE\u590D + size \u5B57\u6BB5\u7248\uFF1A5 \u8DEF\u7B2C\u4E09\u65B9\u63A2\u9488\u5B9E\u6D4B \u2192 \u5931\u6548\u4E24\u901A\u9053\uFF08Hello World 2026-09-11 \u6539\u7248\u4E3A\u4E91\u6C50 API \u4E3B\u9875\u3001\u5FF5\u5FC3 2026-09-11 404 \u7AD9\u70B9\u4E0B\u7EBF\uFF09\u4FDD\u7559\u51FD\u6570\u4F53\u6CE8\u91CA\u4ECE\u7ADE\u901F\u6C60\u79FB\u9664\uFF1Bs01s-mid \u6269\u6863\uFF08pq 24bit/accom Atmos \u76F4\u8BFB song_size_X_str \u5199\u56DE size\uFF09+ \u957F\u9752\u5B88\u95E8\uFF08\u4EC5 128k\u3001\u89E3\u6790\u54CD\u5E94 quality/size \u5B57\u6BB5\uFF09+ \u6D77\u68E0\u8865 Range 0-0 HEAD \u63A2\u6D4B size\uFF1BgetMediaSource \u8FD4\u56DE\u503C\u8865 size \u5B57\u6BB5\uFF08\u53D6\u94FE\u76F4\u5E26 > HEAD \u63A2\u6D4B > \u7559\u7A7A\uFF09\uFF1Bv1.9.1 \u968F\u5305\u5347\u7248\uFF1A\u6B4C\u5355\u5BF9\u8C61\u8865 author \u522B\u540D\u5B57\u6BB5\uFF0C\u8BE6\u89C1\u5934\u90E8 v1.9.1 changelog\uFF1Bv1.9.0 BakaMusic \u9AD8\u4EF7\u503C\u97F3\u6E90\u63A5\u5165\u7248\uFF1AP0 \u6B21\u5408\u4EE3 s01s mid \u76F4\u67E5\u7B2C\u4E09\u65B9\u901A\u9053\u52A0\u5165\u7ADE\u901F\u6C60\uFF08\u7B2C\u4E09\u65B9 6\u21927 \u8DEF\uFF0C\u514D\u641C\u7D22\u6309 mid \u7CBE\u786E\u547D\u4E2D\uFF0Csq \u6863\u5B9E\u6D4B\u771F FLAC ~1647kbps\uFF0C\u5168\u90E8\u8FC7 verifyQualitySize \u9B54\u6570+\u5927\u5C0F\u6821\u9A8C\uFF0CuserVariables.qqS01sMid \u9ED8\u8BA4\u5F00\uFF09\uFF1Bikun QQ \u901A\u9053\u65E0\u5361\u5BC6\u8FD4\u56DE 10 \u79D2\u5360\u4F4D mp3 \u5047\u6210\u529F\u4E0D\u63A5\u5165\uFF08\u5B81\u4F4E\u52FF\u9AD8\uFF09\uFF1Bv1.8.4 \u6B4C\u5355\u5BFC\u5165\u5143\u6570\u636E\u7248\uFF1AimportMusicSheet \u8FD4\u56DE\u5B8C\u6574 IMusicSheetItem \u6B4C\u5355\u5BF9\u8C61\u2014\u2014\u6807\u9898/\u4ECB\u7ECD/\u5C01\u9762\u968F CgiGetDiss dirinfo \u96F6\u989D\u5916\u8BF7\u6C42\u56DE\u4F20\uFF0C\u4ECB\u7ECD\u5B57\u6BB5 description \u5BF9\u9F50\u5BBF\u4E3B v1.0.0 \u5951\u7EA6\uFF1Bv1.8.3 \u8D28\u68C0\u9057\u7559\u4F18\u5316\u7248\uFF1A\u9519\u8BEF\u524D\u7F00\u4E0E code \u53E3\u5F84\u590D\u6838\u786E\u8BA4\u5DF2\u7B26\u5408\u7EDF\u4E00\u6807\u51C6\uFF0C\u968F\u5305\u5347\u7248\uFF1B\u6B4C\u5355\u89E3\u6790\u4FEE\u590D\u7248\uFF1A\u6B4C\u5355\u94FE\u63A5\u8865 /playlistDetail/<id> \u683C\u5F0F + \u6B4C\u5355\u5BFC\u5165\u9519\u8BEF\u7EDF\u4E00\u643A\u5E26\u7ED3\u6784\u5316 code\uFF1B+ v1.8.0\uFF08v1.8.0 MV \u53C2\u6570\u5BF9\u9F50\u57FA\u7EBF\uFF1AgetMvSourceImpl \u9876\u5C42\u5B57\u6BB5\u515C\u5E95+result \u8865 codec/duration/videoQuality \u5199\u56DE\uFF1B\u57FA\u7EBF v1.7.1 \u4FEE\u590D\u4E0E\u5BF9\u9F50\uFF1Afix#1 flac24bit \u97F3\u8D28\u5B9E\u9645\u8BF7\u6C42 flac \u4E22 24bit\u2014\u2014Hello World flac24bit \u4E0A\u79FB master \u6863\u3001\u957F\u9752 flac24bit \u5355\u72EC\u843D flac24bit \u6863\u3001actualQuality \u5982\u5B9E\u6807 flac24bit\uFF08\u5FF5\u5FC3\u65E0 24bit \u4E0A\u6E38\u7EF4\u6301 flac\uFF0C\u80FD\u529B\u8FB9\u754C\u975E\u7F3A\u9677\uFF09\uFF1Bfix#2 192k \u6863 actualQuality \u9519\u6807 128k\u2014\u2014hostQualityToActual \u8865 192k \u663E\u5F0F\u5206\u652F\uFF1B\u53C2\u6570\u5BF9\u9F50 plugin.d.ts\uFF1AIMusicItem/IMusicSheetItem \u81EA\u62A5 platform\u3001getMediaSource \u8FD4\u56DE\u8865\u5BBF\u4E3B\u6807\u51C6 quality \u5B57\u6BB5\u3001defaultSearchType \u663E\u5F0F\u58F0\u660E music\uFF1Bv1.7.0\uFF08v1.7.0 \u7B2C\u4E09\u65B9\u7ADE\u901F\u901A\u9053\u63A5\u5165\uFF1A4 \u8DEF\u5E76\u53D1\u7ADE\u901F\u2014\u2014QQ \u81EA\u8EAB\u4E32\u884C\u94FE + Hello World\uFF08a.aa.cab\uFF0C\u4E3B\u529B\uFF09+ \u957F\u9752\uFF08175.27.166.236\uFF0C\u5907\u4EFD\uFF09+ \u5FF5\u5FC3\uFF08mcp.nianxinxz.com\uFF0C\u515C\u5E95\uFF09\uFF0CkuwoRaceSuccess \u9996\u4E2A\u6709\u6548\u7ED3\u679C\u80DC\u51FA\uFF1B\u7B2C\u4E09\u65B9\u901A\u9053\u542B URL/\u53C2\u6570/\u97F3\u8D28\u6620\u5C04\u5982\u5B9E\u5BF9\u9F50\u5B9E\u6D4B\uFF08master/flac24bit/flac/320k/128k\uFF09\uFF0C\u8FD4\u56DE URL \u7ECF Range \u63A2\u6D4B + \u9B54\u6570\u6821\u9A8C\uFF08fLaC/ID3/MPEG\uFF09+ total \u9608\u503C 2MB\uFF0C\u4E0D\u5339\u914D\u89C6\u4E3A\u5931\u8D25\u7531\u7ADE\u901F\u8BED\u4E49\u81EA\u7136\u964D\u7EA7\uFF1BhostQuality \u900F\u4F20\u2014\u2014getMediaSource\u2192resolveWithFallback\u2192resolveQq \u94FE\u8DEF\u628A\u5BBF\u4E3B\u539F\u59CB quality \u952E\u4F20\u81F3\u7B2C\u4E09\u65B9\u901A\u9053\u7528\u4E8E\u97F3\u8D28\u6620\u5C04\u9009\u62E9\uFF1B\u4F18\u5148\u7EA7\u5B98\u65B9 > Hello World > \u957F\u9752 > \u5FF5\u5FC3\uFF1B4 \u8DEF\u5B9E\u73B0\u5B8C\u6574\u53EF\u7528\u4F46 a.aa.cab/mcp.nianxinxz.com \u7AEF\u70B9\u5F53\u524D\u5DF2\u964D\u7EA7/\u4E0B\u7EBF\uFF0C\u7ADE\u901F\u65F6\u5982\u5B9E\u8BB0\u5F55\u5E76\u63A5\u529B\u4E0B\u4E00\u901A\u9053\uFF1Bv1.6.1\uFF08v1.6.1 HotDownloader \u501F\u9274\u4F18\u5316\uFF1AP0 QRC \u9010\u5B57\u65B9\u6848\u5BF9\u62CD\u2014\u2014HD \u9010\u4F4D DES \u4E0E\u672C\u63D2\u4EF6 SP \u8868\u7248\u5BF9\u771F\u5B9E\u5BC6\u6587\u89E3\u5BC6\u7ED3\u679C\u9010\u5B57\u7B26\u4E00\u81F4\u3001SP \u8868\u7248\u5FEB 2.2 \u500D\uFF082.2ms vs 4.8ms/\u6B21\uFF09\uFF0C\u7EF4\u6301\u73B0\u6709\u5B9E\u73B0\u4E0D\u8FC1\u79FB\uFF1BP0 \u767B\u5F55\u6001\u6CE8\u5165\u2014\u2014userVariables.qqAuthst\uFF08qm_keyst/musickey\uFF09+qqUin \u6216 Cookie \u81EA\u52A8\u89E3\u6790\uFF0C\u6709\u51ED\u636E\u65F6\u5B98\u65B9 CgiGetVkey/GetEVkey \u6309 HD \u5F62\u6001\u628A uin/qq/authst \u6CE8\u5165 comm \u4F53\u5E76\u5E26 param.uin/loginflag:1/platform:20\uFF0Cpurl \u524D\u7F00\u52A8\u6001\u53D6\u54CD\u5E94 sip \u5217\u8868\uFF08\u533F\u540D\u884C\u4E3A\u4E0E v1.6.0 \u4E00\u81F4\uFF09\uFF1BP1 HD 13 \u6863\u6838\u5B9E\u4E0D\u52A0\u6863\u2014\u2014AIM0/Q0M0 \u533F\u540D ekey \u53EF\u7B7E\u53D1\u4F46 purl \u9700\u767B\u5F55\u6001\uFF0C\u5168\u94FE\u4E0D\u53EF\u9A8C\u8BC1\u4E0D\u778E\u52A0\uFF0CC200~O6M0 \u4E3A\u5DF2\u58F0\u660E\u6863\u4F4D\u540C\u5185\u5BB9\u5C01\u88C5\uFF1BP2 HD \u641C\u7D22/\u6B4C\u5355/\u70ED\u952E\u63A5\u53E3\u65E0\u589E\u91CF\u4E0D\u8FC1\u79FB\u3002v1.6.0 \u5BF9\u9F50 go-music-dl \u8C03\u7814 P0+P1\uFF1AP0 GetVkey \u6279\u91CF 7 \u524D\u7F00\u2014\u2014\u5355\u8BF7\u6C42\u540C\u65F6\u67E5 AI00/Q001/Q000/F000/O801/M800/M500\uFF08comm cv=4747474\uFF09\uFF0C\u4E00\u6B21 RTT \u63A2\u660E\u5168\u90E8\u6863\u4F4D\uFF0C\u53D6\u94FE\u5EF6\u8FDF\u8FD1\u4F3C\u51CF\u534A\uFF0C\u5E76\u8865\u9F50 v1.5.0 \u7F3A\u5931\u7684 5 \u4E2A\u524D\u7F00\uFF08AI00 \u6BCD\u5E26/Q001\xB7Q000 \u81FB\u97F3/F000 \u65E0\u635F/O801 \u5168\u666F\u58F0\uFF09\uFF0Cfilename \u6309\u54CD\u5E94 byName map \u5339\u914D\uFF1BX-Forwarded-For \u968F\u673A\u56FD\u5185 IP \u673A\u4F1A\u4E3B\u4E49\u5934\uFF08purl \u7B7E\u53D1\u4E0E\u51FA\u53E3 IP \u5F3A\u76F8\u5173\uFF09\u3002P1 soso \u8001\u641C\u7D22\u515C\u5E95\u2014\u2014do_search_v2 \u62A5\u9519/\u96F6\u7ED3\u679C\u56DE\u843D c.y.qq.com search_for_qq_cp\uFF0CReferer \u5E38\u91CF https://y.qq.com/portal/search.html\uFF08\u5B9E\u6D4B\u4E0D\u5E26=0 \u6761\uFF09\uFF1Bpay \u53CC\u53E3\u5F84\u517C\u5BB9\uFF08payplay/paymonth/paydownload \u8001\u53E3\u5F84\uFF09\uFF1BVIP \u9884\u5224\u2014\u2014fee=1 \u4E14\u65E0 Cookie \u65F6\u8DF3\u8FC7\u5B98\u65B9\u6BB5\uFF08EVkey/\u660E\u6587 CgiGetVkey\uFF09\u76F4\u8FDB\u7B2C\u4E09\u65B9\u94FE\u3002v1.5.0 \u5B57\u6BB5\u8865\u9F50\uFF1Afee VIP \u89D2\u6807\uFF08pay \u5BF9\u8C61\u5B9E\u6D4B\u6620\u5C04\uFF0C\u4E94\u5904\u6761\u76EE\u6784\u5EFA\u70B9+getMusicInfo \u56DE\u586B\uFF09/primaryKey\uFF08\u63D2\u4EF6\u58F0\u660E ["id"] + \u6761\u76EE\u643A\u5E26 songmid\uFF09/\u7F57\u9A6C\u97F3\u6B4C\u8BCD\uFF08GetPlayLyricInfo roma=1 \u2192 QRC \u89E3\u5BC6 \u2192 \u6807\u51C6 LRC\uFF0Cromanization+romaLrc \u53CC\u5B57\u6BB5\uFF0C\u5E76\u884C\u53D6\u5931\u8D25\u9759\u9ED8\u964D\u7EA7\uFF09\uFF1Balias \u5982\u5B9E\u4E0D\u8865\uFF08\u5404\u63A5\u53E3\u65E0\u522B\u540D\u5B57\u6BB5\uFF09\u3002v1.4.0 \u5BF9\u9F50 baka + \u5BBF\u4E3B\u534F\u8BAE\uFF1Bv1.4.0 \u53D6\u94FE\u5E76\u884C\u7ADE\u901F\u2014\u2014\u9177\u6211\u5B98\u65B9\u4E0E\u6D77\u68E0\u7B2C\u4E09\u65B9\u7531\u94FE\u5C3E\u4E32\u884C/\u6162\u8DEF\u5F84\u5BF9\u51B2\u63D0\u524D\u4E3A\u53D6\u94FE\u5165\u53E3\u540C\u65F6\u53D1\u8D77\uFF0C\u4E0E QQ \u81EA\u8EAB\u4E32\u884C\u94FE\u4E09\u8DEF\u7ADE\u901F\uFF08kuwoRaceSuccess \u9996\u4E2A\u6709\u6548\u7ED3\u679C\u80DC\u51FA\uFF0C\u6162\u8DEF\u4E0D cancel \u7ED3\u679C\u4E22\u5F03\uFF09\uFF0C\u94FE\u5185\u5171\u4EAB Promise \u4E0D\u91CD\u53D1\uFF0C\u964D\u7EA7\u94FE/\u8BD5\u542C\u5B88\u536B/\u8D1F\u7F13\u5B58/\u9884\u7B97\u4E0D\u53D8\uFF09\uFF1A\u641C\u7D22/\u6B4C\u8BCD\u641C\u7D22/\u53D6\u94FE/QRC \u9010\u5B57\uFF083DES \u89E3\u5BC6\uFF09/\u699C\u5355/\u6B4C\u5355\uFF08\u771F\u5206\u7C7B\u63A8\u8350+pinned \u6241\u5E73\uFF09/\u6B4C\u624B/\u4E13\u8F91\u5168\u91CF\u7FFB\u9875/MV \u5BCC\u7ED3\u679C\uFF08360p~4k \u6863\u4F4D/\u5BBD\u9AD8/\u7801\u7387/\u5907\u7528\u94FE\uFF09/\u8BC4\u8BBA\u5206\u9875\uFF08\u6570\u503C\u65F6\u95F4\u6233+\u5B50\u8BC4\u8BBA\uFF09/\u76F8\u4F3C\u6B4C\u66F2/\u70ED\u641C\u5168\u529F\u80FD\uFF1B\u53D6\u94FE\u63A5\u529B\uFF1A\u5B98\u65B9 CgiGetVkey \u6279\u91CF 7 \u524D\u7F00 + GetEVkey \u52A0\u5BC6\u6863 + UrlGetVkey \u5C0F\u7C73\u901A\u9053 + vkeys\u65E7\u7248\uFF08VIP\u6B4C\u5168\u957F\uFF09 + vkeys /v2 + \u542C\u4F1A\u4EE3\u7406\uFF08\u9177\u6211CDN\uFF0Cv1.3.1 \u9A8C\u771F\u6062\u590D\uFF09 + s01s + \u6D77\u68E0 + bugpk + cyapi\uFF08\u4EC5 high \u6863 320k\uFF09+ \u9177\u6211\u5B98\u65B9\u63A5\u53E3\u5168\u97F3\u8D28\u515C\u5E95\uFF08standard 128k / high 320k / super 2000kflac \u7ADE\u901F\uFF0Cv1.3.6 \u6362\u8840\u2014\u201496k \u964D\u7EA7\u515C\u5E95\u6BB5\u5168\u90E8\u6458\u9664\uFF09+ \u54AA\u5495\u5B98\u65B9\u53D6\u94FE\u4E8C\u7EA7\u515C\u5E95\uFF08v1.3.7\uFF1Ah5/v2.4 \u4E3A\u4E3B + v2.1/302 \u5907\u4EFD\u7ADE\u901F\uFF0C\u5168\u97F3\u8D28\u6D3E\u751F\uFF0C\u8BD5\u542C/\u63A2\u6D4B\u5931\u8D25\u5982\u5B9E\u56DE\u843D\u5E76\u6807\u6CE8\uFF09\uFF0C\u5931\u8D25\u8D1F\u7F13\u5B58 + \u9012\u51CF\u8D85\u65F6\u9884\u7B97\uFF0CactualQuality \u5982\u5B9E\u6807\u6CE8\uFF0C\u8BD5\u542C\u7247\u6BB5\u5B88\u536B 4xx \u62E6\u622A\uFF1B\u5168\u94FE\u8DEF\u514D\u767B\u5F55\uFF08\u53EF\u9009 Cookie \u589E\u5F3A\uFF09\u3002v1.2.1 \u4FEE\u590D\uFF1A\u699C\u5355\u5206\u7EC4\u53BB"\u805A\u5408"\u9057\u7559\u547D\u540D\uFF08\u6539 QQ\u699C\u5355\uFF09\uFF1B\u699C\u5355\u5C01\u9762\u5BF9\u9F50\u5BBF\u4E3B coverImg \u5B57\u6BB5\u5E76\u56DE\u586B\u7F3A\u56FE\uFF1B\u6B4C\u5355\u66F2\u6570\u5BF9\u9F50 dirinfo.songnum\uFF0C\u4FEE listennum \u8BEF\u4F5C worksNum\u3002v1.3.0\uFF1AP0 \u97F3\u8D28\u5927\u5C0F\u4F20\u9012\u2014\u2014\u641C\u7D22/\u6B4C\u8BCD\u641C\u7D22/\u699C\u5355/\u6B4C\u5355/\u4E13\u8F91/\u6B4C\u624B/\u8BE6\u60C5\u6761\u76EE\u643A\u5E26 qualities[].size\uFF08parseQqFileQualities + CgiGetTrackInfo \u6279\u91CF\u8865\u9F50\uFF09\uFF0CgetMusicInfo \u8865 qualities \u56DE\u586B\uFF08\u5BBF\u4E3B\u7F3A\u5931\u65F6\u81EA\u52A8\u8865\u9F50\uFF09\uFF1BP2 MV availableVideoQualities \u8865 codec\u3002\u9AD8\u7AEF\u6863\uFF08master/atmos/dolby\uFF09\u7ECF\u771F\u5B9E\u8BF7\u6C42\u6838\u9A8C\u65E0\u53EF\u4EA4\u4ED8\u901A\u9053\uFF08\u5360\u4F4D\u7247\u6BB5\uFF09\uFF0C\u7EF4\u6301\u5B81\u7F3A\u6BCB\u5047\u4E0D\u865A\u6807\u3002v1.3.1\uFF1A\u7ED3\u5408\u300AQQ\u97F3\u4E50\u63A5\u53E3\u5B8C\u6574\u6587\u6863_\u5B9E\u6D4B\u6574\u5408\u7248\u300B\u5168\u91CF\u5B9E\u6D4B\uFF088 \u53EF\u7528\u63A5\u53E3\u9010\u4E00\u771F\u5B9E\u8BF7\u6C42\u9A8C\u8BC1\uFF09\uFF0C\u63A5\u5165 vkeys\u65E7\u7248\uFF08VIP \u6B4C\u5168\u957F M500/M800\uFF09/ \u542C\u4F1A\u4EE3\u7406\uFF08standard/exhigh \u5168\u957F\u4E0E qualities.size \u4E00\u81F4\uFF09/ HYWmusic\uFF0896k AAC \u94FE\u5C3E\uFF09\uFF1B\u6D77\u68E0w.net \u5907\u57DF\u540D\u3001cyapi \u65CF\uFF08\u7F3A apikey\uFF09\u3001s01s \u5B9E\u6D4B\u4E0D\u53EF\u7528\u672A\u63A5\u5165\u3002v1.3.2\uFF1A\u542C\u4F1A\u901A\u9053\u77AC\u65F6 502 \u52A0\u56FA\u2014\u20143 \u6B21\u5C1D\u8BD5 + \u6307\u6570\u9000\u907F\uFF08300/600ms\uFF09+ \u9012\u51CF\u8D85\u65F6\uFF082s/1.5s/1s\uFF09\uFF0C\u6BB5\u5185 5s \u9884\u7B97\u5C01\u9876\uFF0C\u4EC5 502/503/504 \u4E0E\u7F51\u7EDC\u9519\u8BEF\u91CD\u8BD5\u3002',
        supportedSearchType: ["music", "album", "artist", "sheet", "lyric"],
        // [v1.7.1 对齐] defaultSearchType 显式声明（宿主 d.ts 可选字段，对齐酷我 v1.2.6 口径）
        defaultSearchType: "music",
        // [v0.7.2 fix#8 核验] supportedQualities 自 v0.7.0 已全档声明：含 flac/flac24bit/hires（无损与 Hi-Res
        // 在音质菜单可见）；宿主增强音质键（master/atmos/dolby/vinyl 等）经 QUALITY_KEY_MAP 全量映射到内部
        // 档位，normalizeQuality 兜底 standard，无需改动。
        // [v1.1.0 fix#2] supportedQualities 去 'hires'（假支持下线）：海棠 tx hires 实测 64 字节占位文件、
        // vkeys 高解析档实测 code=500，无可用真实 hires 通道；宿主 hires/master 等增强键经
        // QUALITY_KEY_MAP 映射 super（真无损），菜单不再虚标 hires 档。
        supportedQualities: ["128k", "192k", "320k", "flac", "flac24bit", "hires", "master"],
        cacheControl: "no-store",
        // 各源播放链接多为签名短时效链接，必须现取
        userVariables: [
          { key: "qqEvkey", name: "QQ \u52A0\u5BC6\u6863\u53D6\u94FE GetEVkey\uFF08\u9ED8\u8BA4\u5F00\uFF09", hint: "\u8BBE\u4E3A off \u5173\u95ED\uFF1B\u5F00\u542F\u540E\u65E0\u635F\u6863\u4F18\u5148\u8D70 QQ GetEVkey \u52A0\u5BC6\u901A\u9053\uFF08\u9700\u5BB6\u5BBD/\u771F\u673A IP\uFF0C\u6570\u636E\u4E2D\u5FC3 IP \u4E0B\u8BE5\u63A5\u53E3\u5927\u6982\u7387\u98CE\u63A7\uFF0C\u5931\u8D25\u81EA\u52A8\u63A5\u529B\u660E\u6587\u5907\u6E90\uFF09" },
          { key: "qqCookie", name: "QQ Cookie\uFF08\u53EF\u9009\uFF09", hint: "\u9009\u586B\uFF1B\u586B\u5199\u540E\u53EF\u63D0\u5347\u53D6\u94FE\u6210\u529F\u7387\u5E76\u89E3\u9501 VIP \u6863 MV\uFF081080p/4k\uFF0C\u65E0 Cookie \u65F6\u7531\u63A5\u53E3 code \u8FC7\u6EE4\u81EA\u52A8\u964D\u6863\uFF09\u3002\u542B qm_keyst \u65F6\u81EA\u52A8\u4F5C\u4E3A\u767B\u5F55\u6001\u6CE8\u5165\u53D6\u94FE comm \u4F53\uFF0C\u65E0\u9700\u518D\u586B qqAuthst" },
          { key: "qqAuthst", name: "QQ \u767B\u5F55\u51ED\u636E qm_keyst\uFF08\u53EF\u9009\xB7v1.6.1 \u65B0\u589E\uFF09", hint: "\u9009\u586B\uFF1B\u5373 Cookie \u91CC\u7684 qm_keyst/musickey \u503C\uFF08\u7F51\u9875\u7248 y.qq.com \u767B\u5F55\u540E F12 \u2192 Application \u2192 Cookies \u590D\u5236\uFF09\uFF0C\u4E0E qqUin \u642D\u914D\u6CE8\u5165\u53D6\u94FE\u8BF7\u6C42 comm \u4F53\uFF08HotDownloader \u540C\u6B3E\u5F62\u6001\uFF09\uFF0C\u63D0\u5347\u65E0\u635F/\u6BCD\u5E26\u6863 purl \u7B7E\u53D1\u7387\u3002\u4F18\u5148\u7EA7\u9AD8\u4E8E Cookie \u5185 qm_keyst\uFF1B\u51ED\u636E\u8FC7\u671F\uFF08\u53D6\u94FE\u8FDE\u7EED 104003\uFF09\u540E\u9700\u91CD\u65B0\u590D\u5236" },
          { key: "qqUin", name: "QQ \u6570\u5B57 uin\uFF08\u53EF\u9009\xB7v1.6.1 \u65B0\u589E\uFF09", hint: "\u9009\u586B\uFF1B\u4E0E qqAuthst \u642D\u914D\u4F7F\u7528\uFF08Cookie \u542B uin \u65F6\u53EF\u81EA\u52A8\u89E3\u6790\uFF0C\u65E0\u9700\u586B\u5199\uFF09" },
          { key: "qqS01sMid", name: "\u6B21\u5408\u4EE3\u7B2C\u4E09\u65B9\u901A\u9053\uFF08v1.9.0 \u65B0\u589E\uFF0C\u9ED8\u8BA4\u5F00\uFF09", hint: "\u8BBE\u4E3A off \u5173\u95ED\uFF1Bs01s mid \u76F4\u67E5\u5F62\u6001\uFF08\u514D\u641C\u7D22\u7CBE\u786E\u547D\u4E2D\uFF0Csq \u6863\u5B9E\u6D4B\u771F FLAC ~1647kbps\uFF09\uFF0C\u52A0\u5165\u7B2C\u4E09\u65B9\u7ADE\u901F\u6C60\uFF0C\u6821\u9A8C\u4E0D\u8FC7\u81EA\u52A8\u9759\u9ED8\u8BA9\u8DEF" },
          { key: "qqAaaCab", name: "a.aa.cab \u641C\u7D22\u578B\u901A\u9053\uFF08v1.9.12 \u65B0\u589E\uFF0C\u9ED8\u8BA4\u5F00\uFF09", hint: "\u8BBE\u4E3A off \u5173\u95ED\uFF1Ba.aa.cab/qq.music \u641C\u7D22\u578B\u53D6\u94FE\uFF08\u66FF\u6362 v1.9.4 \u5DF2\u7981\u7528\u65E7 HelloWorld \u901A\u9053\uFF09\uFF1Bv1.9.13 \u8D77\u6309\u65B9\u6848A \u62D2\u7EDD\u865A\u6807\uFF1A\u4EC5 \u2264320k \u6863\u53C2\u4E0E\u7ADE\u901F\uFF08128k/192k/320k/exhigh\uFF09\uFF0Cflac \u53CA\u4EE5\u4E0A\u97F3\u8D28\u5165\u53E3\u5373\u62D2\u7EDD\u7531\u5176\u4ED6\u901A\u9053\u627F\u62C5\uFF1B\u8DEF\u5F84\u524D\u7F00+tips \u53CC\u5B88\u95E8 fail-closed\uFF0C\u6821\u9A8C\u4E0D\u8FC7\u81EA\u52A8\u9759\u9ED8\u8BA9\u8DEF" }
        ],
        hints: {
          search: ["\u68C0\u7D22 QQ \u97F3\u4E50\u66F2\u5E93", "\u64AD\u653E\u65F6\u81EA\u52A8\u9009\u62E9\u6700\u4F18\u53EF\u7528\u53D6\u94FE\u901A\u9053\uFF0C\u4E3B\u901A\u9053\u5931\u8D25\u81EA\u52A8\u5207\u6362\u5907\u6E90"],
          importMusicSheet: [
            "\u652F\u6301 QQ \u97F3\u4E50\u7684\u6B4C\u5355\u5206\u4EAB\u94FE\u63A5\uFF0C\u5982 y.qq.com/n/ryqq/playlist/xxx",
            "\u4E5F\u652F\u6301\u7EAF\u6570\u5B57\u6B4C\u5355 ID\uFF08QQ \u5355\u6E90\u65E0\u6B67\u4E49\uFF09\uFF1B\u5355\u6B21\u6700\u591A\u5BFC\u5165 500 \u9996"
          ]
        },
        async search(query, page, type) {
          var kw = query && typeof query === "object" ? String(query.keyword || "").trim() : String(query || "").trim();
          if (!kw) return { isEnd: true, data: [] };
          var q = kw;
          if (type === "album") return aggregateSearchBy(ALBUM_SEARCH_ADAPTERS, q, page, albumKeyOf, buildAlbumItem);
          if (type === "artist") return aggregateSearchBy(ARTIST_SEARCH_ADAPTERS, q, page, artistKeyOf, buildArtistItem);
          if (type === "sheet") return aggregateSearchBy(SHEET_SEARCH_ADAPTERS, q, page, sheetKeyOf, buildSheetSearchItem);
          if (type === "lyric") return searchLyricQq(q, page);
          if (type !== "music") return { isEnd: true, data: [] };
          var names = ["qq"];
          var lastErr = "";
          var tasks = names.map(function(n) {
            return SEARCH_ADAPTERS[n](q, page).catch(function(e) {
              lastErr = String(e && e.message || e).slice(0, 160);
              return [];
            });
          });
          var settled = await Promise.all(tasks);
          var all = [];
          var okCount = 0;
          var maxTotal = 0;
          for (var i = 0; i < settled.length; i++) {
            if (settled[i] && settled[i].length > 0) okCount++;
            var srcTotal = settled[i] && settled[i].total || 0;
            if (srcTotal > maxTotal) maxTotal = srcTotal;
            all = all.concat(settled[i] || []);
          }
          if (okCount === 0) throw new Error("\u805A\u5408\u641C\u7D22\u5931\u8D25\uFF1A\u6240\u6709\u97F3\u6E90\u8BF7\u6C42\u5747\u5931\u8D25" + (lastErr ? "\uFF08\u6839\u56E0\uFF1A" + lastErr + "\uFF09" : ""));
          var groups = aggregateItems(all);
          var scored = groups.map(function(g, idx) {
            return { g, score: scoreOf(g.members[0], g.members.length), idx };
          });
          scored.sort(function(a, b) {
            if (b.score !== a.score) return b.score - a.score;
            return a.idx - b.idx;
          });
          var data = [];
          for (var j = 0; j < scored.length; j++) {
            data.push(buildMusicItem(scored[j].g));
          }
          return { isEnd: maxTotal > 0 ? page * SEARCH_PAGE_SIZE >= maxTotal : data.length === 0, data };
        },
        async getMediaSource(musicItem, quality) {
          if (!musicItem) throw new Error("missing musicItem");
          var q = normalizeQuality(quality);
          var hostQ = String(quality || "");
          if ((!musicItem._src || !Object.keys(musicItem._src).length) && musicItem.url) {
            var localQ = internalToHostQuality(q);
            return probeHeadSize(musicItem.url, 2e3).then(function(size) {
              var out = { url: String(musicItem.url), actualQuality: localQ, quality: localQ, channel: "local" };
              if (size > 0) out.size = size;
              return out;
            }).catch(function() {
              return { url: String(musicItem.url), actualQuality: localQ, quality: localQ, channel: "local" };
            });
          }
          return resolveWithFallback(musicItem, q, hostQ).then(function(r) {
            if (r && r.url && r.quality === void 0 && r.actualQuality) r.quality = r.actualQuality;
            var snap = function(rr) {
              if (!rr || !rr.url) return rr;
              var cur = rr.quality || rr.actualQuality;
              var got = snapQualityToMeasured(cur, rr.size, musicItem && musicItem.duration);
              if (got && got !== cur) {
                rr.quality = got;
                rr.actualQuality = got;
              }
              return rr;
            };
            if (r && r.url && !r.size) {
              return probeHeadSize(r.url, 2e3).then(function(size) {
                if (size > 0) r.size = size;
                return snap(r);
              }).catch(function() {
                return r;
              });
            }
            return snap(r);
          });
        },
        async getLyric(musicItem) {
          return getLyricImpl(musicItem);
        },
        // v0.7.0 P0-2：逐字歌词（QQ QRC，原生源优先 + 接力）
        async getWordByWordLyric(musicItem) {
          return getWordByWordLyricImpl(musicItem);
        },
        // v0.7.0 P0-3：单曲分享链接导入（QQ）
        async importMusicItem(urlLike) {
          return importMusicItemImpl(urlLike);
        },
        // v0.7.0 P0-4：歌曲详情（多源补齐封面/专辑/时长/MV）
        // [v0.7.2 fix#9 核验] getMusicInfo 自 v0.7.0 P0-4 已实现（getMusicInfoImpl）：详情补齐
        // （专辑/时长/MV 字段）。
        async getMusicInfo(musicItem) {
          return getMusicInfoImpl(musicItem);
        },
        async getTopLists() {
          var officialGroups = [];
          try {
            officialGroups = await fetchQqToplistGroups();
          } catch (e) {
          }
          var coverByTopId = {};
          for (var oi = 0; oi < officialGroups.length; oi++) {
            var odata = officialGroups[oi].data || [];
            for (var oj = 0; oj < odata.length; oj++) {
              var om = /^qqtop~(\d+)$/.exec(odata[oj].id || "");
              if (om && odata[oj].coverImg && !coverByTopId[om[1]]) coverByTopId[om[1]] = odata[oj].coverImg;
            }
          }
          var groups = [{
            title: "QQ\u699C\u5355",
            data: CHART_DEFS.map(function(d) {
              var qqTopId = d.members && d.members[0] && d.members[0].source === "qq" ? String(d.members[0].id) : "";
              var cover = d.cover || coverByTopId[qqTopId] || "";
              return { id: d.id, title: d.title, coverImg: cover, artwork: cover, platform: "qq" };
            })
          }];
          for (var qi = 0; qi < officialGroups.length; qi++) groups.push(officialGroups[qi]);
          return groups;
        },
        async getTopListDetail(topListItem, page) {
          var tid = topListItem && topListItem.id || "";
          if (tid.indexOf("qqtop~") === 0) {
            var qqTopId = tid.slice(6);
            var qp = page || 1;
            var qrows = await CHART_FETCHERS.qq(qqTopId, (qp - 1) * 100);
            var qMusicList = qrows.map(buildSheetItem);
            return { isEnd: qrows.length < 100, musicList: qMusicList, topListItem: { id: topListItem.id, title: topListItem.title, coverImg: topListItem.coverImg, artwork: topListItem.artwork, platform: "qq" } };
          }
          if (page && page > 1) return { isEnd: true, musicList: [] };
          var def = findChartDef(tid);
          if (!def) throw new Error("\u672A\u77E5\u699C\u5355: " + tid);
          var musicList2 = await getAggregatedChart(def);
          return { isEnd: true, musicList: musicList2, topListItem: { id: topListItem.id, title: topListItem.title, coverImg: topListItem.coverImg, artwork: topListItem.artwork, platform: "qq" } };
        },
        async importMusicSheet(urlLike) {
          return importMusicSheetImpl(urlLike);
        },
        async getAlbumInfo(albumItem) {
          return getAlbumInfoImpl(albumItem);
        },
        async getArtistWorks(artistItem, page, type) {
          return getArtistWorksImpl(artistItem, page, type);
        },
        async getMusicSheetInfo(sheetItem, page) {
          return getMusicSheetInfoImpl(sheetItem, page);
        },
        async getRecommendSheetTags() {
          return getRecommendSheetTagsImpl();
        },
        async getRecommendSheetsByTag(tagItem, page) {
          return getRecommendSheetsByTagImpl(tagItem, page);
        },
        async getMusicComments(musicItem, page) {
          return getMusicCommentsImpl(musicItem, page);
        },
        async getMvSource(musicItem, videoQuality) {
          return getMvSourceImpl(musicItem, videoQuality);
        },
        // [v1.2.0 对齐 baka] 歌曲详情页外链（宿主 IPluginDefine.getMusicDetailPageUrl）
        getMusicDetailPageUrl(musicItem) {
          var srcMap = musicItem && musicItem._src;
          var mid = srcMap && srcMap.qq && srcMap.qq.mid;
          if (!mid && musicItem && musicItem.songmid) mid = String(musicItem.songmid);
          return mid ? "https://y.qq.com/n/ryqq/songDetail/" + mid : void 0;
        },
        supportedVideoQualities: [
          // [v1.2.0 对齐 baka] MV 档位声明修正：ft10 实为 360p，补 4k
          { key: "360p", label: "360P" },
          { key: "480p", label: "480P" },
          { key: "720p", label: "720P" },
          { key: "1080p", label: "1080P" },
          { key: "4k", label: "4K" }
        ],
        // ===== 以下为内部函数，供测试脚本复用（非插件协议方法）=====
        _internal: {
          normalizeTitle,
          looseTitleKey,
          normalizeArtist,
          makeKey,
          parseVersionTags,
          versionCompatible,
          versionTier,
          isSameSong,
          aggregateItems,
          buildMusicItem,
          scoreOf,
          pickCandidates,
          canServe,
          qqEvkeyRequest,
          resolveQqVkeys,
          resolveQqS01s,
          resolveQqPlainOfficial,
          resolveQq,
          qrcDecryptHex,
          fetchQqQrc,
          fetchQqQrcRelay,
          fetchQqToplistGroups,
          randomGuid,
          SOURCE_WEIGHT,
          SOURCE_QUALITIES,
          SEARCH_ADAPTERS,
          RESOLVE_ADAPTERS,
          guardFullAudio,
          CHART_DEFS,
          CHART_FETCHERS,
          mergeChartLists,
          buildChartItem,
          getAggregatedChart,
          SHEET_URL_RESOLVERS,
          SHEET_FETCHERS,
          resolveSheetId,
          buildSheetItem,
          importMusicSheetImpl,
          LYRIC_ADAPTERS,
          getLyricImpl,
          // 惰性 getter：本对象字面量在 var 赋值（文件尾部）之前求值，
          // 直接取值会是 undefined；用 getter 保证调用时拿到已赋值的表。
          get ALBUM_SEARCH_ADAPTERS() {
            return ALBUM_SEARCH_ADAPTERS;
          },
          get ARTIST_SEARCH_ADAPTERS() {
            return ARTIST_SEARCH_ADAPTERS;
          },
          get SHEET_SEARCH_ADAPTERS() {
            return SHEET_SEARCH_ADAPTERS;
          },
          get ALBUM_DETAIL() {
            return ALBUM_DETAIL;
          },
          get ARTIST_MUSIC() {
            return ARTIST_MUSIC;
          },
          get ARTIST_ALBUM() {
            return ARTIST_ALBUM;
          },
          get MV_SOURCE() {
            return MV_SOURCE;
          },
          getAlbumInfoImpl,
          getArtistWorksImpl,
          getMusicSheetInfoImpl,
          getRecommendSheetTagsImpl,
          getRecommendSheetsByTagImpl,
          getMusicCommentsImpl,
          getMvSourceImpl,
          searchLyricQq,
          parseQqFileQualities,
          fetchQqTrackInfoSizes,
          normalizeColonTimeTag,
          aggregateSearchBy,
          // v0.7.0 新增（P0/P1 自测用）
          normalizeQuality,
          QUALITY_KEY_MAP,
          importMusicItemImpl,
          getMusicInfoImpl,
          getWordByWordLyricImpl,
          // [v1.5.0 P1/P2] 字段补齐（自测用）：fee 映射 / 罗马音取词
          qqFeeOf,
          fetchQqRomaLrc,
          SONG_URL_RESOLVERS,
          resolveSongId,
          SONG_DETAIL_FETCHERS,
          fetchQqComments,
          haitangLevelOf,
          resolveHaitang,
          // [v1.7.0] 第三方取链通道 4 路竞速（自测用）
          // [v1.9.12] resolveQqHelloWorld（旧 mid 直查形态）v1.9.4 已禁用删除，替换为 resolveQqAaaCab（搜索型新端点）
          resolveQqAaaCab,
          resolveQqChangqing,
          resolveQqNianxin,
          verifyQualitySize,
          thirdPartyTierOf,
          changqingTierOf,
          nianxinTierOf,
          hostQualityToActual,
          // [v1.3.1] 接口文档实测扩充：vkeys旧版 / 听会代理恢复 / HYWmusic 链尾
          resolveQqVkeysLegacy,
          resolveQqTinghui,
          // [v1.3.2] 听会 502 重试加固：重试分类器 + 常量表（自测用）
          tinghuiIsRetryable,
          TINGHUI_ATTEMPT_TIMEOUTS,
          TINGHUI_BACKOFFS,
          TINGHUI_RETRY_TOTAL,
          resolveQqCyapi,
          // [v1.3.6] 酷我官方全音质兜底（HYW/xcvts/玉宁熙已退出接力链；v1.3.8 删除三者死代码）
          resolveKuwoFallback,
          // [v1.4.0] 同曲严格校验四件套（自测用）：候选搜索 / 同曲筛选 / 逐项校验 / 标签拆分
          searchKuwoCandidates,
          pickKuwoRid,
          kuwoSameTrackCheck,
          kuwoVersionSplit,
          kuwoArtistSet,
          kuwoOfficialResolve,
          kuwoDesResolve,
          kuwoRaceSuccess,
          racePriority,
          kuwoEncryptQuery,
          KUWO_BR,
          // [v1.3.7] 咪咕官方取链二级兜底（h5/v2.4 为主，供通道级实测）
          resolveMiguFallback,
          searchMiguCid,
          decryptH5v24,
          miguH5Resolve,
          miguAppResolve,
          migu305Resolve,
          deriveMiguUrl,
          miguActualQuality,
          H5V24_KEY,
          CYAPI_KEY,
          chainSegTimeout,
          setChainDeadlineForTest: function(v) {
            CHAIN_DEADLINE = v;
          },
          // [v1.1.0] resolveTinghuiQq 曾删除（听会 HTTP 裸 IP 段剔除），v1.3.1 以验真形式恢复为 resolveQqTinghui
          resolveQqBugpk,
          resolveQqUrlGetVkey,
          negCacheCheck,
          negCacheRecord,
          // [v1.1.0] 接口扩充：MV 搜索 / 相似歌曲 / 热门搜索 / base64-Hermes 兼容解码
          searchMvQq,
          getSimilarSongsQq,
          getHotSearchQq,
          b64DecodeUtf8,
          LYRIC_TIMEOUT,
          // v0.7.1 新增（走查修复自测用）
          isAllowedMediaUrl,
          withTimeout,
          RESOLVE_BUDGET_MS,
          RELAY_TIMEOUT,
          // [v0.7.2] 新增（还债包回归自测用）
          internalToHostQuality,
          resolveWithFallback
        }
      };
      async function searchMvQq(kw, page) {
        var p = page || 1;
        var res = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
          comm: { ct: "11", cv: "1003006" },
          req: {
            module: "music.search.SearchCgiService",
            method: "DoSearchForQQMusicDesktop",
            param: { query: kw, search_type: 4, page_num: p, num_per_page: SEARCH_PAGE_SIZE }
          }
        }, { timeout: SOURCE_TIMEOUT, headers: QQ_SEARCH_HEADERS });
        var grp = res.data && res.data.req && res.data.req.data && res.data.req.data.body && res.data.req.data.body.mv;
        var list = grp && grp.list || [];
        if (!list.length && p === 1) {
          var res2 = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
            comm: { ct: "11", cv: "1003006" },
            req: {
              module: "music.search.SearchCgiService",
              method: "DoSearchForQQMusicDesktop",
              param: { query: kw, search_type: 4, page_num: p, num_per_page: SEARCH_PAGE_SIZE }
            }
          }, { timeout: SOURCE_TIMEOUT, headers: QQ_SEARCH_HEADERS });
          grp = res2.data && res2.data.req && res2.data.req.data && res2.data.req.data.body && res2.data.req.data.body.mv;
          list = grp && grp.list || [];
        }
        var items = list.map(function(it) {
          if (!it || !it.v_id) return null;
          return {
            vid: String(it.v_id),
            title: stripEm(it.mv_name || it.mvName_hilight || ""),
            artist: Array.isArray(it.singer_list) && it.singer_list.length ? it.singer_list.map(function(s) {
              return s.name;
            }).join("/") : stripEm(String(it.singer_name || "")),
            cover: it.mv_pic_url || void 0,
            duration: parseInt(it.duration, 10) || void 0,
            playCount: it.play_count,
            publishDate: it.publish_date,
            raw: { vid: String(it.v_id) }
          };
        }).filter(Boolean);
        var total = parseInt(grp && (grp.total_num || grp.sum) || 0, 10) || 0;
        items.total = total;
        return { isEnd: total > 0 ? p * SEARCH_PAGE_SIZE >= total : items.length < SEARCH_PAGE_SIZE, data: items };
      }
      async function getSimilarSongsQq(midOrSongId, limit) {
        var n = parseInt(limit, 10) || 30;
        var numId = /^\d+$/.test(String(midOrSongId)) ? String(midOrSongId) : await fetchQqSongNumericId(midOrSongId);
        var res = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
          comm: { ct: "24", cv: "0" },
          req: {
            module: "music.recommend.TrackRelationServer",
            method: "GetSimilarSongs",
            param: { songid: parseInt(numId, 10), vecSimilarSongids: [] }
          }
        }, { timeout: SOURCE_TIMEOUT, headers: { Referer: "https://y.qq.com/", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "Content-Type": "application/json" } });
        var vec = res.data && res.data.req && res.data.req.data && res.data.req.data.vecSong;
        if (!Array.isArray(vec)) return [];
        return vec.slice(0, n).map(function(v) {
          var t = v && v.track || {};
          var singers = Array.isArray(t.singer) ? t.singer.map(function(s) {
            return s.name;
          }).join("/") : "";
          var album = t.album || {};
          return {
            source: "qq",
            sid: t.mid,
            title: t.name || "",
            artist: singers,
            album: album.name || "",
            artwork: album.mid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + album.mid + ".jpg" : void 0,
            duration: t.file && t.file.interval || t.interval || void 0,
            raw: { mid: t.mid, songid: numId }
          };
        }).filter(function(x) {
          return x.sid && x.title;
        });
      }
      async function getHotSearchQq() {
        var res = await axios.get("https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg", {
          params: { format: "json" },
          timeout: SOURCE_TIMEOUT,
          headers: { Referer: "https://y.qq.com/", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        });
        var hotkey = res.data && res.data.data && res.data.data.hotkey;
        if (!Array.isArray(hotkey)) return [];
        return hotkey.map(function(h) {
          return { keyword: h.k, score: h.n };
        }).filter(function(x) {
          return x.keyword;
        });
      }
      module.exports = plugin;
      var SEARCH_PAGE_SIZE = 20;
      function stripEm(s) {
        return String(s == null ? "" : s).replace(/<\/?em>/g, "");
      }
      var QQ_SEARCH_HEADERS = {
        Referer: "https://y.qq.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Content-Type": "application/json"
      };
      function qqCategorySearch(method, searchType, q, page) {
        var body = {
          comm: { ct: "11", cv: "1003006" },
          req: {
            module: "music.search.SearchCgiService",
            method,
            param: { search_type: searchType, query: q, page_num: page, num_per_page: SEARCH_PAGE_SIZE }
          }
        };
        return axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", body, {
          timeout: SOURCE_TIMEOUT,
          headers: QQ_SEARCH_HEADERS
        }).then(function(r) {
          var reqData = r.data && r.data.req && r.data.req.data;
          if (!reqData) throw new Error("qq category search: no data");
          return reqData;
        });
      }
      function searchAlbumQq(q, page) {
        function mapMobile(it) {
          var mid = str(it.mid || it.albummid || it.id);
          return {
            source: "qq",
            sid: mid,
            title: stripEm(it.name || it.albumname),
            artist: splitArtists(it.singer),
            artwork: it.pic || it.img || (mid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + mid + ".jpg" : ""),
            date: it.timePublic || it.aDate || "",
            worksNum: it.track_num || 0,
            raw: { mid }
          };
        }
        function mapV2(it) {
          var ci = it.ci || {};
          var mid = str(ci.mid || it.mid || it.id);
          return {
            source: "qq",
            sid: mid,
            title: stripEm(it.title || it.name),
            artist: str(ci.singer_name || ""),
            artwork: it.pic || (mid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + mid + ".jpg" : ""),
            date: it.publishDate || (it.desc ? String(it.desc).slice(-10) : ""),
            worksNum: Number(ci.track_num) || 0,
            raw: { mid }
          };
        }
        function mapDesktop(it) {
          var mid = str(it.albumMID || it.mid || it.albummid);
          var singers = Array.isArray(it.singer_list) ? it.singer_list.map(function(s) {
            return s.name;
          }).join("/") : stripEm(it.singerName || "");
          return {
            source: "qq",
            sid: mid,
            title: stripEm(it.albumName || it.name),
            artist: singers,
            artwork: it.albumPic || it.pic || (mid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + mid + ".jpg" : ""),
            date: it.publicTime || it.timePublic || "",
            worksNum: parseInt(it.song_count, 10) || it.track_num || 0,
            raw: { mid }
          };
        }
        return qqCategorySearch("DoSearchForQQMusicDesktop", 2, q, page).then(function(reqData) {
          var g = ((reqData || {}).body || {}).album;
          var list = g && (g.list || g.items) || [];
          return list.map(mapDesktop).filter(function(it) {
            return it.sid && it.title;
          });
        }).then(function(items) {
          if (items.length > 0) return items;
          return qqCategorySearch("DoSearchForQQMusicMobile", 2, q, page).then(function(reqData) {
            var g = ((reqData || {}).body || {}).item_album;
            var list = g && (g.list || g.items) || [];
            return list.map(mapMobile).filter(function(it) {
              return it.sid && it.title;
            });
          });
        }).then(function(items) {
          if (items.length > 0) return items;
          return axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
            comm: { ct: "24", cv: "0" },
            req: { module: "music.adaptor.SearchAdaptor", method: "do_search_v2", param: { query: q, search_type: 2, page_num: page, num_per_page: SEARCH_PAGE_SIZE } }
          }, { timeout: SOURCE_TIMEOUT, headers: QQ_SEARCH_HEADERS }).then(function(r) {
            var g = (((r.data || {}).req || {}).data || {}).body;
            g = g && g.item_album;
            var list = g && (g.items || g.list) || [];
            var out = list.map(mapV2).filter(function(it) {
              return it.sid && it.title;
            });
            out.total = parseInt(g && g.total_num || 0, 10) || 0;
            return out;
          });
        });
      }
      function searchArtistQq(q, page) {
        return qqCategorySearch("DoSearchForQQMusicDesktop", 1, q, page).then(function(reqData) {
          var list = (((reqData || {}).body || {}).singer || {}).list || [];
          return list.map(function(it) {
            var mid = str(it.singerMID);
            return {
              source: "qq",
              sid: mid,
              name: stripEm(it.singerName),
              avatar: it.singerPic ? String(it.singerPic) : "",
              worksNum: it.songNum || 0,
              raw: { singerMID: mid, singerId: it.singerID ? String(it.singerID) : "", name: stripEm(it.singerName) }
            };
          }).filter(function(it) {
            return it.sid && it.name;
          });
        });
      }
      function searchSheetQq(q, page) {
        return qqCategorySearch("DoSearchForQQMusicMobile", 3, q, page).then(function(reqData) {
          var list = ((reqData || {}).body || {}).item_songlist || [];
          return list.map(function(it) {
            var dissid = str(it.dissid || it.disstid);
            return {
              source: "qq",
              sid: dissid,
              title: stripEm(it.dissname || it.name),
              artist: it.nickname || "",
              artwork: it.logo || it.imgurl || it.img || "",
              worksNum: it.songnum || 0,
              raw: { listId: dissid }
            };
          }).filter(function(it) {
            return it.sid && it.title;
          });
        });
      }
      var ALBUM_SEARCH_ADAPTERS = {
        qq: searchAlbumQq
      };
      var ARTIST_SEARCH_ADAPTERS = {
        qq: searchArtistQq
      };
      var SHEET_SEARCH_ADAPTERS = {
        qq: searchSheetQq
      };
      function aggregateBy(items, keyOf) {
        var map = {}, order = [];
        for (var i = 0; i < items.length; i++) {
          var k = keyOf(items[i]);
          if (!k) continue;
          if (!map[k]) {
            map[k] = { members: [] };
            order.push(k);
          }
          map[k].members.push(items[i]);
        }
        var out = [];
        for (var j = 0; j < order.length; j++) out.push(map[order[j]]);
        return out;
      }
      function bestMember(members) {
        var best = members[0], bw = SOURCE_WEIGHT[best.source] || 0.5;
        for (var i = 1; i < members.length; i++) {
          var w = SOURCE_WEIGHT[members[i].source] || 0.5;
          if (w > bw || w === bw && !best.artwork && members[i].artwork) {
            best = members[i];
            bw = w;
          }
        }
        return best;
      }
      function srcMapOf(members) {
        var src = {};
        for (var i = 0; i < members.length; i++) {
          var m = members[i];
          if (!src[m.source]) src[m.source] = m.raw;
        }
        return src;
      }
      function buildAlbumItem(group, seq) {
        var members = group.members;
        var best = bestMember(members);
        var artwork = best.artwork, date = best.date, worksNum = best.worksNum;
        for (var i = 0; i < members.length; i++) {
          if (!artwork && members[i].artwork) artwork = members[i].artwork;
          if (!date && members[i].date) date = members[i].date;
          if (!worksNum && members[i].worksNum) worksNum = members[i].worksNum;
        }
        return {
          id: best.source + "~al~" + best.sid,
          platform: "qq",
          title: best.title,
          artist: best.artist,
          artwork: artwork || void 0,
          date: date || void 0,
          worksNum: worksNum || void 0,
          description: "",
          _asrc: srcMapOf(members)
        };
      }
      function buildArtistItem(group, seq) {
        var members = group.members;
        var best = bestMember(members);
        var avatar = best.avatar, worksNum = best.worksNum;
        for (var i = 0; i < members.length; i++) {
          if (!avatar && members[i].avatar) avatar = members[i].avatar;
          if (!worksNum && members[i].worksNum) worksNum = members[i].worksNum;
        }
        return {
          id: best.source + "~ar~" + best.sid,
          platform: "qq",
          name: best.name,
          avatar: avatar || "",
          worksNum: worksNum || 0,
          description: "",
          _rsrc: srcMapOf(members)
        };
      }
      function buildSheetSearchItem(group, seq) {
        var members = group.members;
        var best = bestMember(members);
        var artwork = best.artwork, worksNum = best.worksNum, artist = best.artist;
        for (var i = 0; i < members.length; i++) {
          if (!artwork && members[i].artwork) artwork = members[i].artwork;
          if (!worksNum && members[i].worksNum) worksNum = members[i].worksNum;
          if (!artist && members[i].artist) artist = members[i].artist;
        }
        return {
          id: best.source + "~pl~" + best.sid,
          platform: "qq",
          title: best.title,
          artist: artist || "",
          artwork: artwork || void 0,
          worksNum: worksNum || void 0,
          description: "",
          _ssrc: srcMapOf(members)
        };
      }
      function albumKeyOf(it) {
        return normalizeTitle(it.title) + "|" + normalizeArtist(it.artist);
      }
      function artistKeyOf(it) {
        return normalizeTitle(it.name);
      }
      function sheetKeyOf(it) {
        return normalizeTitle(it.title);
      }
      async function aggregateSearchBy(adapterMap, q, page, keyOf, buildItem) {
        var names = Object.keys(adapterMap);
        var lastErr = "";
        var tasks = names.map(function(n) {
          return adapterMap[n](q, page).catch(function(e) {
            lastErr = String(e && e.message || e).slice(0, 160);
            if (process && process.env && process.env.AG_DEBUG) console.error("[adapter:" + n + "] " + lastErr);
            return [];
          });
        });
        var settled = await Promise.all(tasks);
        if (process && process.env && process.env.AG_DEBUG) {
          for (var di = 0; di < settled.length; di++) console.error("[agg:" + names[di] + "] items=" + (settled[di] || []).length);
        }
        var all = [];
        var okCount = 0;
        var maxTotal = 0;
        for (var i = 0; i < settled.length; i++) {
          if (settled[i] && settled[i].length > 0) okCount++;
          var srcTotal = settled[i] && settled[i].total || 0;
          if (srcTotal > maxTotal) maxTotal = srcTotal;
          all = all.concat(settled[i] || []);
        }
        if (okCount === 0) throw new Error("\u805A\u5408\u641C\u7D22\u5931\u8D25\uFF1A\u6240\u6709\u97F3\u6E90\u8BF7\u6C42\u5747\u5931\u8D25" + (lastErr ? "\uFF08\u6839\u56E0\uFF1A" + lastErr + "\uFF09" : ""));
        var groups = aggregateBy(all, keyOf);
        var data = [];
        for (var j = 0; j < groups.length; j++) data.push(buildItem(groups[j], j));
        data.sort(function(a, b) {
          var sa = (a.artwork ? 2 : 0) + (a.worksNum ? 1 : 0);
          var sb = (b.artwork ? 2 : 0) + (b.worksNum ? 1 : 0);
          return sb - sa;
        });
        return { isEnd: maxTotal > 0 ? page * SEARCH_PAGE_SIZE >= maxTotal : data.length === 0, data };
      }
      function dedupeBySid(entries) {
        var seen = {};
        var out = [];
        for (var i = 0; i < entries.length; i++) {
          var k = entries[i].source + "|" + entries[i].sid;
          if (seen[k]) continue;
          seen[k] = 1;
          out.push(entries[i]);
        }
        return out;
      }
      function sourcesByWeight(srcMap) {
        return Object.keys(srcMap).sort(function(a, b) {
          return (SOURCE_WEIGHT[b] || 0.5) - (SOURCE_WEIGHT[a] || 0.5);
        });
      }
      function albumItemFromEntry(e) {
        return buildAlbumItem({ members: [e] }, 0);
      }
      function sheetSearchItemFromEntry(e) {
        return buildSheetSearchItem({ members: [e] }, 0);
      }
      async function albumSongListPage(albumMid, begin, num) {
        var r = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
          comm: { ct: "24", cv: "0" },
          req: { module: "music.musichallAlbum.AlbumSongListServer", method: "GetAlbumSongList", param: { albumMid, begin, num } }
        }, { timeout: SOURCE_TIMEOUT, headers: QQ_SEARCH_HEADERS });
        var d = r.data && r.data.req && r.data.req.data;
        var list = d && (d.songList || d.list) || [];
        var total = d && (parseInt(d.total_song, 10) || parseInt(d.total, 10)) || 0;
        return { list, total };
      }
      function mapAlbumSong(it, albumMid) {
        var s = it.songInfo || it.song || it;
        return {
          source: "qq",
          sid: str(s.mid),
          title: stripEm(str(s.name || s.songname)),
          artist: splitArtists(s.singer),
          album: s.album && s.album.name ? String(s.album.name) : "",
          duration: parseInt(s.interval, 10) || 0,
          artwork: albumMid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + albumMid + ".jpg" : "",
          qualities: parseQqFileQualities(s.file),
          // [v1.3.0 P0-1] 专辑曲目带音质表
          raw: { mid: str(s.mid), mediaMid: s.file && s.file.media_mid ? String(s.file.media_mid) : "", vid: s.mv && s.mv.vid ? String(s.mv.vid) : "" }
        };
      }
      var ALBUM_DETAIL = {
        qq: async function(raw) {
          try {
            var r = await axios.get("https://c.y.qq.com/v8/fcg-bin/fcg_v8_album_info_cp.fcg", {
              params: { albummid: raw.mid, format: "json" },
              timeout: SOURCE_TIMEOUT,
              headers: { Referer: "https://y.qq.com/", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
            });
            var data = r.data && r.data.data;
            var list = data && data.list || [];
            if (!list.length) throw new Error("empty");
            var total = data.total || list.length;
            var entries = list.map(function(it) {
              return {
                source: "qq",
                sid: str(it.songmid),
                title: stripEm(str(it.songname)),
                artist: splitArtists(it.singer),
                album: it.albumname ? String(it.albumname) : "",
                duration: parseInt(it.interval, 10) || 0,
                artwork: raw.mid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + raw.mid + ".jpg" : "",
                qualities: parseQqFileQualities(it.file),
                // [v1.3.0 P0-1] 专辑详情主路曲目带音质表
                raw: { mid: str(it.songmid), mediaMid: it.songmid ? String(it.songmid) : "", vid: it.mv && it.mv.vid ? String(it.mv.vid) : "" }
              };
            });
            if (data.total && data.total > entries.length) {
              var abegin = entries.length;
              var apages = 0;
              var albumSignatures = /* @__PURE__ */ new Set();
              while (abegin < data.total && apages < 20) {
                var pg = await albumSongListPage(raw.mid, abegin, 100);
                if (!pg.list.length) {
                  throw new Error("[QQ\u97F3\u4E50] \u4E13\u8F91\u5206\u9875\u63D0\u524D\u7ED3\u675F\uFF0C\u8BF7\u91CD\u8BD5");
                }
                var asig = JSON.stringify(pg.list.map(function(x) {
                  return x && (x.songmid || x.songid || x.id);
                }));
                if (albumSignatures.has(asig)) throw new Error("[QQ\u97F3\u4E50] \u4E13\u8F91\u5206\u9875\u91CD\u590D\u8FD4\u56DE\u540C\u4E00\u9875\uFF0C\u8BF7\u91CD\u8BD5");
                albumSignatures.add(asig);
                for (var pi = 0; pi < pg.list.length; pi++) entries.push(mapAlbumSong(pg.list[pi], raw.mid));
                abegin += pg.list.length;
                apages++;
              }
            }
            var needQ = [];
            for (var qi = 0; qi < entries.length; qi++) {
              if (!entries[qi].qualities) needQ.push(entries[qi].raw.mid);
            }
            if (needQ.length) {
              var sizeMap = await fetchQqTrackInfoSizes(needQ);
              for (var qi2 = 0; qi2 < entries.length; qi2++) {
                if (!entries[qi2].qualities && sizeMap[entries[qi2].raw.mid]) entries[qi2].qualities = sizeMap[entries[qi2].raw.mid];
              }
            }
            return {
              albumItem: {
                title: data.name ? String(data.name) : "",
                artist: data.singername ? String(data.singername) : "",
                artwork: raw.mid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + raw.mid + ".jpg" : "",
                date: data.aDate ? String(data.aDate) : "",
                worksNum: total
              },
              entries
            };
          } catch (e1) {
            var APAGE = 100;
            var abegin2 = 0;
            var entries2 = [];
            var totalSong = 0;
            var albumSignatures2 = /* @__PURE__ */ new Set();
            for (var ap = 0; ap < 20; ap++) {
              var pg2 = await albumSongListPage(raw.mid, abegin2, APAGE);
              totalSong = pg2.total || totalSong;
              if (!pg2.list.length) {
                if (totalSong && entries2.length < totalSong) throw new Error("[QQ\u97F3\u4E50] \u4E13\u8F91\u5206\u9875\u63D0\u524D\u7ED3\u675F\uFF0C\u8BF7\u91CD\u8BD5");
                break;
              }
              var asig2 = JSON.stringify(pg2.list.map(function(x) {
                return x && (x.songmid || x.songid || x.id);
              }));
              if (albumSignatures2.has(asig2)) throw new Error("[QQ\u97F3\u4E50] \u4E13\u8F91\u5206\u9875\u91CD\u590D\u8FD4\u56DE\u540C\u4E00\u9875\uFF0C\u8BF7\u91CD\u8BD5");
              albumSignatures2.add(asig2);
              for (var pj = 0; pj < pg2.list.length; pj++) entries2.push(mapAlbumSong(pg2.list[pj], raw.mid));
              abegin2 += pg2.list.length;
              if (totalSong && entries2.length >= totalSong) break;
            }
            return {
              albumItem: { title: "", artist: "", artwork: raw.mid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + raw.mid + ".jpg" : "", worksNum: totalSong || entries2.length },
              entries: entries2
            };
          }
        }
      };
      async function getAlbumInfoImpl(albumItem) {
        var src = albumItem && albumItem._asrc || {};
        var names = sourcesByWeight(src);
        if (!names.length) throw new Error("\u8BE5\u6761\u76EE\u65E0\u53EF\u7528\u7684\u4E13\u8F91\u8BE6\u60C5\u6E90");
        var lastErr = null;
        for (var i = 0; i < names.length; i++) {
          try {
            var out = await ALBUM_DETAIL[names[i]](src[names[i]]);
            if (!out.entries.length) throw new Error("empty album");
            var musicList = out.entries.map(buildSheetItem);
            var item = {};
            for (var k in albumItem) {
              if (k !== "_asrc") item[k] = albumItem[k];
            }
            if (out.albumItem.title && !item.title) item.title = out.albumItem.title;
            if (out.albumItem.date && !item.date) item.date = out.albumItem.date;
            if (out.albumItem.worksNum && !item.worksNum) item.worksNum = out.albumItem.worksNum;
            if (out.albumItem.artwork && !item.artwork) item.artwork = out.albumItem.artwork;
            return { isEnd: true, albumItem: item, musicList };
          } catch (e) {
            lastErr = e;
          }
        }
        throw lastErr || new Error("\u4E13\u8F91\u8BE6\u60C5\u83B7\u53D6\u5931\u8D25");
      }
      var ARTIST_MUSIC = {
        qq: async function(raw, page) {
          var body = {
            comm: { ct: "24", cv: "0" },
            req: {
              module: "music.adaptor.SearchAdaptor",
              method: "do_search_v2",
              param: { query: raw.name, search_type: 0, page_num: page, num_per_page: 50 }
            }
          };
          var res = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", body, {
            timeout: SOURCE_TIMEOUT,
            headers: QQ_SEARCH_HEADERS
          });
          var reqData = res.data && res.data.req && res.data.req.data;
          var groupS = ((reqData || {}).body || {}).item_song || {};
          var items = groupS.items || [];
          var searchTotal = parseInt(groupS.total_num, 10) || 0;
          var filtered = items.filter(function(it) {
            var singers = it.singer || [];
            if (raw.singerMID) return singers.some(function(s) {
              return str(s.mid) === str(raw.singerMID);
            });
            return singers.some(function(s) {
              return str(s.name) === str(raw.name);
            });
          });
          return {
            entries: filtered.map(function(it) {
              var albumMid = it.album && it.album.mid ? String(it.album.mid) : "";
              return {
                source: "qq",
                sid: str(it.mid),
                title: stripEm(str(it.name)),
                artist: splitArtists(it.singer),
                album: it.album && it.album.name ? String(it.album.name) : "",
                duration: parseInt(it.interval, 10) || 0,
                artwork: albumMid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + albumMid + ".jpg" : "",
                qualities: parseQqFileQualities(it.file),
                // [v1.3.0 P0-1] 歌手作品条目带音质表
                raw: { mid: str(it.mid), mediaMid: it.file && it.file.media_mid ? String(it.file.media_mid) : "", vid: it.mv && it.mv.vid ? String(it.mv.vid) : "" }
              };
            }),
            // [v1.1.0 审查#10] isEnd 用搜索 total_num 判定（无 total 回退 items.length<50）。
            // 召回局限：GetSingerSong 匿名 500003 风控、H5 fcg_v8_singer_track_cp 已 404（2026-09-06 实测），
            // 名字搜索+singerMID 过滤是当前唯一可用路径；冷门曲目召回不全需真机/Cookie 后再评估。
            isEnd: searchTotal > 0 ? page * 50 >= searchTotal : items.length < 50
          };
        }
      };
      var ARTIST_ALBUM = {
        qq: async function(raw, page) {
          var r = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
            comm: { ct: "24", cv: "0" },
            req: {
              module: "music.musichallAlbum.AlbumListServer",
              method: "GetAlbumList",
              param: { singermid: raw.singerMID, begin: (page - 1) * 30, num: 30 }
            }
          }, { timeout: SOURCE_TIMEOUT, headers: QQ_SEARCH_HEADERS });
          var d = r.data && r.data.req && r.data.req.data;
          var list = d && (d.albumList || d.list) || d && d.data && (d.data.albumList || d.data.list) || [];
          var totalA = d && (parseInt(d.total, 10) || parseInt(d.totalNum, 10)) || 0;
          return {
            entries: list.map(function(it) {
              var mid = str(it.mid || it.albumMid);
              return {
                source: "qq",
                sid: mid,
                title: stripEm(str(it.name || it.albumName)),
                artist: raw.name || "",
                artwork: mid ? "https://y.gtimg.cn/music/photo_new/T002R300x300M000" + mid + ".jpg" : "",
                date: it.pubTime || it.aDate || "",
                worksNum: it.song_count || it.songNum || 0,
                raw: { mid }
              };
            }),
            // [v1.1.0 审查#10] isEnd 用 total 判定（无 total 回退 list.length<30）
            isEnd: totalA > 0 ? (page - 1) * 30 + list.length >= totalA : list.length < 30
          };
        }
      };
      async function getArtistWorksImpl(artistItem, page, type) {
        var p = page || 1;
        var src = artistItem && artistItem._rsrc || {};
        var names = sourcesByWeight(src);
        if (!names.length) throw new Error("\u8BE5\u6761\u76EE\u65E0\u53EF\u7528\u7684\u6B4C\u624B\u8BE6\u60C5\u6E90");
        var resolvers = type === "album" ? ARTIST_ALBUM : ARTIST_MUSIC;
        var lastErr = null;
        for (var i = 0; i < names.length; i++) {
          var resolver = resolvers[names[i]];
          if (!resolver) continue;
          try {
            var out = await resolver(src[names[i]], p);
            if (!out.entries.length && p === 1) throw new Error("empty result");
            var data = out.entries.map(type === "album" ? albumItemFromEntry : buildSheetItem);
            return { isEnd: out.isEnd !== void 0 ? out.isEnd : out.entries.length < 30, data };
          } catch (e) {
            lastErr = e;
          }
        }
        if (lastErr) throw lastErr;
        return { isEnd: true, data: [] };
      }
      async function getMusicSheetInfoImpl(sheetItem, page) {
        if (page && page > 1) return { isEnd: true, musicList: [] };
        var src = sheetItem && sheetItem._ssrc || {};
        var names = sourcesByWeight(src);
        if (!names.length) throw new Error("\u8BE5\u6761\u76EE\u65E0\u53EF\u7528\u7684\u6B4C\u5355\u8BE6\u60C5\u6E90");
        var lastErr = null;
        for (var i = 0; i < names.length; i++) {
          try {
            var entries = await SHEET_FETCHERS[names[i]](src[names[i]].listId);
            if (!entries.length) throw new Error("empty sheet");
            var musicList = dedupeBySid(entries).map(buildSheetItem);
            var realTotal = Number(entries && entries.total) || 0;
            var sheetInfo = Object.assign({}, sheetItem, {
              worksNum: realTotal > 0 ? realTotal : musicList.length || void 0
            });
            return { isEnd: true, sheetItem: sheetInfo, musicList };
          } catch (e) {
            lastErr = e;
          }
        }
        throw lastErr || new Error("\u6B4C\u5355\u8BE6\u60C5\u83B7\u53D6\u5931\u8D25");
      }
      var MV_QUALITY_LEVELS = [
        { ft: 10, quality: "360p", height: 360 },
        { ft: 20, quality: "480p", height: 480 },
        { ft: 30, quality: "720p", height: 720 },
        { ft: 40, quality: "1080p", height: 1080 },
        { ft: 50, quality: "4k", height: 2160 }
      ];
      var MV_QUALITY_ORDER = ["360p", "480p", "720p", "1080p", "4k"];
      var MV_SOURCE = {
        qq: async function(raw, qIdx) {
          if (!raw || !raw.vid) return null;
          var r = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
            comm: { ct: 24, guid: "10000" },
            req: {
              module: "gosrf.Stream.MvUrlProxy",
              method: "GetMvUrls",
              param: { vids: [raw.vid], request_typet: 10001, guid: "10000" }
            }
          }, { timeout: SOURCE_TIMEOUT, headers: qqCookieHeaders(QQ_SEARCH_HEADERS) });
          var rd = r.data && r.data.req && r.data.req.data;
          var gd = rd && rd.getMvUrl ? rd.getMvUrl : rd;
          var entry = gd && gd.data ? gd.data[raw.vid] : gd ? gd[raw.vid] : null;
          var mp4s = entry && entry.mp4 || [];
          var streams = [];
          for (var i = 0; i < mp4s.length; i++) {
            var m = mp4s[i];
            if (!m || m.code !== 0) continue;
            var ft = m.filetype || m.ft;
            var lv = null;
            for (var L = 0; L < MV_QUALITY_LEVELS.length; L++) {
              if (MV_QUALITY_LEVELS[L].ft === ft) {
                lv = MV_QUALITY_LEVELS[L];
                break;
              }
            }
            if (!lv) continue;
            var u0 = m.freeflow_url && m.freeflow_url[0] || m.url && m.url[0];
            if (!u0) continue;
            streams.push({ level: lv, stream: m, url: String(u0) });
          }
          if (!streams.length) return null;
          var target = MV_QUALITY_LEVELS[qIdx >= 0 && qIdx < MV_QUALITY_LEVELS.length ? qIdx : 2];
          var picked = null;
          for (var s2 = 0; s2 < streams.length; s2++) {
            if (streams[s2].level.ft === target.ft) {
              picked = streams[s2];
              break;
            }
          }
          if (!picked) {
            for (var s3 = streams.length - 1; s3 >= 0; s3--) {
              if (streams[s3].level.height <= target.height) {
                picked = streams[s3];
                break;
              }
            }
          }
          if (!picked) picked = streams[streams.length - 1];
          var urls = [picked.url];
          if (picked.stream.freeflow_url) {
            for (var u2 = 0; u2 < picked.stream.freeflow_url.length; u2++) {
              var uu = String(picked.stream.freeflow_url[u2] || "");
              if (uu && urls.indexOf(uu) < 0) urls.push(uu);
            }
          }
          var size = Number(picked.stream.fileSize || picked.stream.filesize || picked.stream.size || 0) || void 0;
          var exp = Number(picked.stream.expire);
          var expiresAt = (Number.isFinite ? Number.isFinite(exp) : isFinite(exp)) && exp > 0 ? Date.now() + exp * 1e3 : void 0;
          var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
          return {
            url: picked.url.replace(/^http:/i, "https:"),
            headers: { Referer: "https://y.qq.com/", "User-Agent": UA },
            userAgent: UA,
            videoQuality: picked.level.quality,
            mimeType: "video/mp4",
            width: Number(picked.stream.width) || void 0,
            height: Number(picked.stream.height) || picked.level.height,
            bitrate: Number(picked.stream.bitrate) || void 0,
            size,
            // [v1.8.0 P1-4] 顶层 result 补 codec（从 picked.stream.codec/codecs 透传），
            // 与 availableVideoQualities 内档位 codec 同源
            codec: picked.stream.codec || picked.stream.codecs || void 0,
            // [v1.8.0 P1-3] 顶层 result 补 duration（源条目无 MV duration 上游，从 musicItem 顶层透传；
            // 宿主 getMvDuration 为空时回退到曲目时长，UI 显示「MV 时长≈曲目时长」更可接受）
            duration: void 0,
            // 由 getMvSourceImpl 调用方根据 musicItem.duration 注入
            availableVideoQualities: streams.map(function(st) {
              return {
                key: st.level.quality,
                label: st.level.quality,
                width: Number(st.stream.width) || void 0,
                height: Number(st.stream.height) || st.level.height,
                bitrate: Number(st.stream.bitrate) || void 0,
                size: Number(st.stream.fileSize || st.stream.filesize || st.stream.size || 0) || void 0,
                codec: st.stream.codec || st.stream.codecs || void 0,
                // [v1.3.0 P2-1] 对齐 baka：MV 档位补编码信息
                mimeType: "video/mp4"
              };
            }),
            backupUrls: urls.slice(1),
            expiresAt
          };
        }
      };
      async function getMvSourceImpl(musicItem, videoQuality) {
        if (!musicItem) return null;
        var qKey = videoQuality && typeof videoQuality === "string" ? videoQuality : videoQuality && videoQuality.key || "720p";
        var qIdx = MV_QUALITY_ORDER.indexOf(qKey);
        if (qIdx < 0) qIdx = 2;
        var src = musicItem._src || {};
        if (src.qq && !src.qq.vid) {
          var topVid = musicItem.videoId || musicItem.mvId || musicItem.mvid || musicItem.mv || musicItem.mvVid || musicItem.mvCopyrightId || musicItem.bvid;
          if (topVid) src.qq.vid = String(topVid);
        }
        if (src.qq) {
          if (!src.qq.vid && src.qq.mid) {
            try {
              var det = await SONG_DETAIL_FETCHERS.qq(src.qq.mid);
              if (det && det.raw && det.raw.vid) src.qq.vid = det.raw.vid;
            } catch (e) {
            }
          }
          try {
            var r2 = await MV_SOURCE.qq(src.qq, qIdx);
            if (r2) {
              if (r2.duration === void 0 && musicItem.duration) r2.duration = musicItem.duration;
              if (r2.videoQuality && !musicItem.videoQuality) {
                try {
                  musicItem.videoQuality = r2.videoQuality;
                } catch (e) {
                }
              }
              return r2;
            }
          } catch (e) {
          }
        }
        return null;
      }
      async function getRecommendSheetTagsImpl() {
        try {
          var r = await axios.get("https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_tag_conf.fcg", {
            params: { picmid: 2, format: "json", inCharset: "utf-8", outCharset: "utf-8" },
            timeout: SOURCE_TIMEOUT,
            headers: { Referer: "https://y.qq.com/", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
          });
          var cats = r.data && r.data.data && r.data.data.categories || [];
          var data = [];
          for (var i = 0; i < cats.length; i++) {
            var items = (cats[i].items || []).filter(function(t) {
              return t && t.usable !== 0;
            });
            if (!items.length) continue;
            data.push({
              title: str(cats[i].categoryGroupName),
              data: items.map(function(t) {
                return { id: "qqtag~" + str(t.categoryId), title: str(t.categoryName), platform: "qq" };
              })
            });
          }
          if (!data.length) throw new Error("empty categories");
          var pinned = [{ id: "qq~rec~0", title: "\u63A8\u8350", platform: "qq" }];
          for (var pc = 0; pc < data.length && pinned.length < 12; pc++) {
            pinned.push(data[pc].data[0]);
          }
          return { pinned, data };
        } catch (e) {
          var pinnedFallback = [{ id: "qq~rec~0", title: "\u63A8\u8350", platform: "qq" }];
          return { pinned: pinnedFallback, data: [] };
        }
      }
      async function getRecommendSheetsByTagImpl(tagItem, page) {
        var p = page || 1;
        var id = tagItem && (tagItem.id || (typeof tagItem === "string" ? tagItem : "")) || "";
        var entries = [];
        var isEnd = true;
        if (!id || id.indexOf("qq~rec") === 0) {
          var r2 = await axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", {
            comm: { ct: "24", cv: "0" },
            req: { module: "music.playlist.PlaylistSquare", method: "GetRecommendFeed", param: { From: (p - 1) * 30, Size: 30 } }
          }, { timeout: SOURCE_TIMEOUT, headers: QQ_SEARCH_HEADERS });
          var rd2 = r2.data && r2.data.req && r2.data.req.data || {};
          var list = rd2.List || [];
          entries = list.map(function(x) {
            var b = x && x.Playlist && x.Playlist.basic || {};
            var cover = b.cover && (b.cover.small_url || b.cover.medium_url) || "";
            return {
              source: "qq",
              sid: str(b.tid),
              title: str(b.title),
              artist: b.creator && b.creator.nick ? String(b.creator.nick) : "",
              artwork: cover,
              // [v1.2.1 fix#3] GetRecommendFeed basic 自带 song_cnt（真实曲数），直接透传；
              // 详情层另由 dirinfo.songnum 兜底回填
              worksNum: parseInt(b.song_cnt, 10) || 0,
              raw: { listId: str(b.tid) }
            };
          });
          isEnd = rd2.HasMore !== void 0 ? !rd2.HasMore : list.length < 30;
        } else if (id.indexOf("qqtag~") === 0) {
          var catId = str(id.slice("qqtag~".length));
          var sin = (p - 1) * 30;
          var r3 = await axios.get("https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg", {
            params: { categoryId: catId, sin, ein: sin + 29, sortId: 5, format: "json", inCharset: "utf-8", outCharset: "utf-8" },
            timeout: SOURCE_TIMEOUT,
            headers: { Referer: "https://y.qq.com/", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
          });
          var d3 = r3.data && r3.data.data;
          var list3 = d3 && d3.list || [];
          var sum = d3 && parseInt(d3.sum, 10) || 0;
          entries = list3.map(function(x) {
            return {
              source: "qq",
              sid: str(x.dissid),
              title: str(x.dissname),
              artist: x.creator && x.creator.name ? String(x.creator.name) : x.nickname ? String(x.nickname) : "",
              artwork: x.imgurl ? String(x.imgurl) : "",
              // [v1.2.1 fix#3] fcg_get_diss_by_tag 列表无曲数字段，原把 listennum（播放次数，
              // 实测 854 万）误作 worksNum，导致歌单页显示几百万"首"。列表层置 0（聚合后为
              // undefined），详情层由 CgiGetDiss dirinfo.songnum 回填真实曲数（实测 854 万播放
              // 的歌单真实 66 首）
              worksNum: 0,
              raw: { listId: str(x.dissid) }
            };
          });
          isEnd = sum > 0 ? sin + list3.length >= sum : list3.length < 30;
        } else {
          return { isEnd: true, data: [] };
        }
        return { isEnd, data: entries.filter(function(e) {
          return e.sid && e.title;
        }).map(sheetSearchItemFromEntry) };
      }
      var QQ_NUMID_CACHE = {};
      function fetchQqSongNumericId(mid) {
        if (QQ_NUMID_CACHE[mid]) return Promise.resolve(QQ_NUMID_CACHE[mid]);
        return axios.get("https://c.y.qq.com/v8/fcg-bin/fcg_play_single_song.fcg", {
          params: { songmid: mid, tp: "yqq_song_detail", format: "json" },
          timeout: SOURCE_TIMEOUT,
          headers: { Referer: "https://y.qq.com/", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        }).then(function(res) {
          var t = res.data && res.data.data && res.data.data[0];
          if (!t || !t.id) throw new Error("qq numeric id n/a");
          QQ_NUMID_CACHE[mid] = String(t.id);
          return QQ_NUMID_CACHE[mid];
        });
      }
      async function fetchQqComments(mid, page) {
        var numId = await fetchQqSongNumericId(mid);
        var mk = function(method, PageNum) {
          return {
            comm: { ct: "24", cv: "0" },
            req: {
              module: "music.globalComment.CommentRead",
              method,
              param: {
                BizType: 1,
                BizId: numId,
                LastCommentSeqNo: "",
                PageSize: 20,
                PageNum,
                HotType: 1,
                WithAirborne: 0,
                PicEnable: 1,
                BizSubType: 2
              }
            }
          };
        };
        var opt = { timeout: SOURCE_TIMEOUT, headers: { "Content-Type": "application/json", Referer: "https://y.qq.com/", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } };
        var hotReq = page === 1 ? axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", mk("GetHotCommentList", 0), opt).then(function(r) {
          var cl = r.data && r.data.req && r.data.req.data && r.data.req.data.CommentList;
          return cl && cl.Comments || [];
        }).catch(function() {
          return [];
        }) : Promise.resolve([]);
        var newReq = axios.post("https://u.y.qq.com/cgi-bin/musicu.fcg", mk("GetNewCommentList", page - 1), opt).then(function(r) {
          var d0 = r.data && r.data.req && r.data.req.data;
          var cl = d0 && d0.CommentList;
          return { list: cl && cl.Comments || [], total: cl && cl.Total || 0 };
        });
        var both = await Promise.all([hotReq, newReq]);
        return { hot: both[0], newest: both[1].list, total: both[1].total };
      }
      async function getMusicCommentsImpl(musicItem, page) {
        var p = page || 1;
        var src = musicItem && musicItem._src || {};
        var tasks = [];
        var sources = [];
        if (src.qq && src.qq.mid) {
          sources.push("qq");
          tasks.push(fetchQqComments(src.qq.mid, p).catch(function() {
            return null;
          }));
        }
        if (!tasks.length) return { isEnd: true, data: [] };
        var settled = await Promise.all(tasks);
        var seen = {};
        var data = [];
        function push(c, isHot, source) {
          if (!c) return;
          var cid = c.commentId || c.id || c.CmId;
          if (!cid || seen[cid]) return;
          seen[cid] = 1;
          var body = c.msg || c.content || c.Content;
          var nick = c.user && (c.user.nickname || c.user.nick) || c.Nick || c.userName || c.u_name;
          var avatar = c.user && (c.user.avatarUrl || c.user.avatar) || c.Avatar || c.avatar || c.u_pic;
          var like = c.likedCount || c.PraiseNum || c.likedCount || c.like_num || c.praiseNum || 0;
          var time = c.time || c.PubTime;
          var loc = c.user && c.user.location || c.Location || c.location;
          var createAt;
          if (typeof time === "number") createAt = time > 1e12 ? time : time * 1e3;
          else if (typeof time === "string" && /^\d+$/.test(time)) {
            var tn = Number(time);
            createAt = tn > 1e12 ? tn : tn * 1e3;
          } else createAt = void 0;
          var replies;
          var subs = c.SubComments || c.subComments;
          if (Array.isArray(subs) && subs.length) {
            replies = subs.map(function(sc) {
              var sct = sc.time || sc.PubTime;
              var scn = sc.user && (sc.user.nickname || sc.user.nick) || sc.Nick || sc.userName || sc.u_name;
              var sca = sc.user && (sc.user.avatarUrl || sc.user.avatar) || sc.Avatar || sc.avatar || sc.u_pic;
              var sctn = typeof sct === "number" ? sct > 1e12 ? sct : sct * 1e3 : typeof sct === "string" && /^\d+$/.test(sct) ? Number(sct) * 1e3 : void 0;
              return {
                id: source + "_" + String(sc.commentId || sc.id || sc.CmId || "").slice(0, 64),
                nickName: scn ? String(scn) : "\u672A\u77E5\u7528\u6237",
                avatar: sca ? String(sca) : void 0,
                comment: String(sc.msg || sc.content || sc.Content || ""),
                like: sc.likedCount || sc.PraiseNum || sc.praiseNum || 0,
                createAt: sctn,
                location: sc.user && sc.user.location || sc.Location || void 0
              };
            });
          }
          data.push({
            id: source + "_" + String(cid).slice(0, 64),
            nickName: nick ? String(nick) : "\u672A\u77E5\u7528\u6237",
            avatar: avatar ? String(avatar) : void 0,
            comment: body ? String(body) : "",
            like: like || 0,
            createAt,
            location: loc ? String(loc) : void 0,
            isHot,
            replies
          });
        }
        var anyData = false;
        var hasMore = false;
        for (var s = 0; s < settled.length; s++) {
          var r = settled[s];
          if (!r) continue;
          anyData = true;
          if (sources[s] === "qq" && r.total > 0) {
            hasMore = hasMore || r.total > p * 20;
          } else if (sources[s] === "qq" && r.newest && r.newest.length >= 20) {
            hasMore = true;
          }
          var hot = r.hot || [], newest = r.newest || [];
          for (var i = 0; i < hot.length; i++) push(hot[i], true, sources[s]);
          for (var j = 0; j < newest.length; j++) push(newest[j], false, sources[s]);
        }
        if (!anyData) return { isEnd: true, data: [] };
        return { isEnd: !hasMore, data };
      }
    }
  });

  // _entry_47836.js
  var require_entry_47836 = __commonJS({
    "_entry_47836.js"(exports, module) {
      var __plugin = require_qq_source_plugin_v1_9_26();
      module.exports = __plugin;
    }
  });
  return require_entry_47836();
})();

  var plugin = __MF_PLUGIN_BUNDLE__;
  if (plugin && plugin.default) plugin = plugin.default;
  if (!plugin || typeof plugin !== 'object') {
    throw new Error('[MF adapter] 插件未导出对象: 20');
  }

  var PROVIDER_ID = "qqdiag";

  // ===== 数据转换工具 =====
  function toTrack(item, idx) {
    item = item || {};
    var id = String(item.id || item.songId || item.mid || item.hash || (idx != null ? idx : Math.random().toString(36).slice(2)));
    var artists = [];
    if (Array.isArray(item.artists)) artists = item.artists.map(function (a) { return typeof a === 'string' ? a : (a && a.name) || ''; }).filter(Boolean);
    else if (item.artist) artists = String(item.artist).split(/[,，/、]/).map(function(s){return s.trim();}).filter(Boolean);
    // qualities 归一化为字符串数组（SDK assertContentPage 严格要求 string[]，
    // 而多数 MF 插件返回的是 {128k:{size},320k:{size}} 对象）
    var qualities = undefined;
    if (Array.isArray(item.qualities)) {
      qualities = item.qualities.map(function (q) { return String(typeof q === 'object' && q ? (q.type || q.quality || q.name || '') : q); })
        .filter(Boolean).slice(0, 128);
    } else if (item.qualities && typeof item.qualities === 'object') {
      qualities = Object.keys(item.qualities).map(function (q) { return String(q); }).filter(Boolean).slice(0, 128);
    }
    if (qualities && !qualities.length) qualities = undefined;
    // duration：MF 的 duration 多为秒，durationMs 才是毫秒
    var durMs = Number(item.durationMs || 0) || (Number(item.duration || 0) > 0 ? Math.round(Number(item.duration) * 1000) : 0);

    return {
      ref: {
        providerId: PROVIDER_ID,
        kind: 'track',
        id: id,
        scope: 'provider',
        // 关键：把完整 MF musicItem 塞进 ref.data，供 resolve/lyrics 还原
        data: item
      },
      title: String(item.title || item.name || '未知曲目'),
      subtitle: artists.join(' / ') || String(item.album || ''),
      capabilities: ['play'],
      metadata: {
        artists: artists,
        album: item.album ? { title: String(item.album) } : undefined,
        durationMs: durMs || undefined,
        artworkUrl: item.artwork || item.cover || item.picUrl || item.image || undefined,
        qualities: qualities
      }
    };
  }

  function fromResource(resource) {
    // 真机：App 传入的是 ref 本身 { providerId, kind, id, scope, data }，
    // 完整 MF item 藏在 ref.data 里。旧 mock 传整个 track { ref:{...}, ... }。
    // 两种形态都兼容。
    var data = null;
    if (resource) {
      if (resource.data && typeof resource.data === 'object') data = resource.data;          // ref 本身
      else if (resource.ref && resource.ref.data && typeof resource.ref.data === 'object') data = resource.ref.data; // 整个 track
    }
    if (data && typeof data === 'object' && Object.keys(data).length) return data;
    var id = (resource && resource.id) || (resource && resource.ref && resource.ref.id) || '';
    var title = (resource && resource.title) || '';
    return { id: id, title: title, artist: '' };
  }

  // ===== LRC -> CrLyric 毫秒时间轴 =====
  function lrcToCrLyric(lrc, resource) {
    var lines = [];
    if (typeof lrc !== 'string' || !lrc) {
      return { format: 'crlyric', version: 1, track: resource, offsetMs: 0, lines: [] };
    }
    // 支持 [mm:ss.xx] 与 [mm:ss:xx]
    var re = /\[(\d{1,3}):(\d{2})[.:](\d{1,3})\]/g;
    var raw = lrc.split(/\r?\n/);
    for (var i = 0; i < raw.length; i++) {
      var line = raw[i];
      var matches = [];
      var mm;
      re.lastIndex = 0;
      while ((mm = re.exec(line)) !== null) {
        var t = parseInt(mm[1], 10) * 60000 + parseInt(mm[2], 10) * 1000 + parseInt(mm[3].padEnd(3, '0'), 10);
        matches.push(t);
      }
      if (!matches.length) continue;
      var text = line.replace(re, '').trim();
      for (var j = 0; j < matches.length; j++) {
        lines.push({ startTimeMs: matches[j], endTimeMs: matches[j] + 4000, text: text });
      }
    }
    lines.sort(function (a, b) { return a.startTimeMs - b.startTimeMs; });
    for (var k = 0; k < lines.length - 1; k++) {
      if (lines[k + 1].startTimeMs > lines[k].startTimeMs) lines[k].endTimeMs = lines[k + 1].startTimeMs;
    }
    return { format: 'crlyric', version: 1, track: resource, offsetMs: 0, lines: lines };
  }

  // ===== 协议桥接函数 =====
  async function __mfSearch(request, operation) {
    if (!plugin.search) return { items: [] };
    globalThis.__MF_OP__ = operation;
    try {
      var query = String((request && request.query) || '');
      var page = (request && request.page) || 1;
      // MF 约定第三个参数是 type，默认 'music'（多数插件据此决定是否返回）
      var type = (request && request.type) || 'music';
      var res = await plugin.search(query, page, type);
      // MF search 标准返回 { isEnd, data: musicItem[] }；兼容 items/list/裸数组
      var list = Array.isArray(res) ? res :
        (res && (Array.isArray(res.data) ? res.data : (res.items || res.list))) || [];
      
      // ===== 诊断模式：把返回值特征编码进 title，真机搜索界面可读 =====
      var diagItems = [];
      function drow(t, s) { diagItems.push({ ref:{providerId:PROVIDER_ID,kind:'track',id:'dg'+diagItems.length,scope:'provider'}, title:String(t), subtitle:String(s||''), capabilities:[], metadata:{artists:['DIAG']} }); }
      drow('DG-q', query + '|p' + page + '|' + type);
      drow('DG-res', 'arr=' + Array.isArray(res) + ' keys=' + (res ? Object.keys(res).join(',') : 'NULL'));
      drow('DG-list', 'len=' + list.length);
      drow('DG-http', 'calls=' + ((globalThis.__MF_HTTP_LOG__||[]).length));
      (globalThis.__MF_HTTP_LOG__||[]).slice(-3).forEach(function(h,i){ drow('DG-h'+i, h); });
      return { items: diagItems };
      
    } catch (e) { var di=[{ref:{providerId:PROVIDER_ID,kind:'track',id:'dge',scope:'provider'},title:'DG-ERR',subtitle:String(e&&e.message).slice(0,60),capabilities:[],metadata:{artists:['DIAG']}}]; return {items:di}; }
  }

  async function __mfResolve(resource, quality, operation) {
    if (!plugin.getMediaSource) return { ok: false, error: { code: 'UNSUPPORTED', message: '插件不支持取链' } };
    globalThis.__MF_OP__ = operation;
    try {
      var item = fromResource(resource);
      var q = quality || undefined;
      var res = await plugin.getMediaSource(item, q);
      if (!res) return { ok: false, error: { code: 'EMPTY', message: '取链返回空' } };
      // MF 返回 { url, headers, quality, ... }
      // 注意 App(source.ts) 读 result.requestHeaders 和 result.error.message（非 headers / 字符串）
      var url = String(res.url || res.source || '');
      if (!url) return { ok: false, error: { code: 'NO_URL', message: '取链未返回地址' } };
      return {
        ok: true,
        url: url,
        requestHeaders: res.headers || undefined,
        expiresAt: res.expiresAt || res.expireTime || undefined
      };
    } catch (e) {
      return { ok: false, error: { code: 'ERROR', message: String((e && e.message) || e || '取链异常') } };
    }
  }

  async function __mfLyrics(resource, operation) {
    var empty = { format: 'crlyric', version: 1, track: resource, offsetMs: 0, lines: [] };
    if (!plugin.getLyric) return empty;
    globalThis.__MF_OP__ = operation;
    var item = fromResource(resource);
    try {
      var res = await plugin.getLyric(item);
      var lrc = (typeof res === 'string') ? res : (res && (res.lrc || res.lyric || res.text)) || '';
      return lrcToCrLyric(lrc, resource);
    } catch (e) { return empty; } // 如荔枝FM播客无歌词，降级为空而非报错
  }

  // chartId -> 榜单项 缓存：真机进入榜单详情时 App 可能只传精简 ref（无 data，见 Browse.vue resourceRef），
  // 此时按 id 从缓存反查榜单项再调 getTopListDetail
  var __chartCache = {};

  function __findChartById(id) {
    return Object.prototype.hasOwnProperty.call(__chartCache, id) ? __chartCache[id] : null;
  }

  async function __rebuildChartCache() {
    if (!plugin.getTopLists) return;
    try {
      var res = await plugin.getTopLists();
      var groups = Array.isArray(res) ? res : (res && (res.items || res.list || res.data)) || [];
      for (var gi = 0; gi < groups.length; gi++) {
        var g = groups[gi] || {};
        var arr = Array.isArray(g.data) ? g.data : (Array.isArray(g.items) ? g.items : (Array.isArray(g) ? g : []));
        for (var ci = 0; ci < arr.length; ci++) {
          var c = arr[ci] || {};
          var cid = String(c.id || c.title || ('chart-' + gi + '-' + ci));
          if (!__chartCache[cid]) __chartCache[cid] = c;
        }
      }
    } catch (e) { /* 忽略，缓存重建失败时保持空 */ }
  }

  async function __mfChartsList(operation) {
    if (!plugin.getTopLists) return { items: [] };
    globalThis.__MF_OP__ = operation;
    try {
      var res = await plugin.getTopLists();
      // MF 协议：getTopLists() -> [{ title:分组名, data:[榜单项, ...] }, ...]
      // 榜单项 = { id, title, coverImg, ... }。要打平成"每个榜单项 = 一个 chart"。
      var groups = Array.isArray(res) ? res : (res && (res.items || res.list || res.data)) || [];
      var items = [];
      var seen = {};
      for (var gi = 0; gi < groups.length; gi++) {
        var group = groups[gi] || {};
        var groupTitle = String(group.title || group.name || '');
        var chartItems = Array.isArray(group.data) ? group.data
          : (Array.isArray(group.items) ? group.items : (Array.isArray(group) ? group : []));
        for (var ci = 0; ci < chartItems.length; ci++) {
          var c = chartItems[ci] || {};
          // id 必须唯一且非空；用榜单项 id，冲突时加分组名与序号
          var rawId = String(c.id || c.title || ('chart-' + gi + '-' + ci));
          var chartId = rawId;
          if (seen[chartId]) chartId = rawId + '-' + groupTitle + '-' + ci;
          seen[chartId] = 1;
          // ref.data 存榜单项本身（getTopListDetail 需要它）；同步写入缓存供精简 ref 反查
          __chartCache[chartId] = c;
          // SDK 规范：MusicChart.chart?: ChartMetadata = { updateFrequency?, artworkUrl? }
          // App artworkOf 依次读 chart.artworkUrl / playlist.artworkUrl / metadata.artworkUrl / 顶层 artworkUrl
          var chartArtwork = c.coverImg || c.cover || c.picUrl || c.img || c.image || c.avatar || undefined;
          var chartItem = {
            ref: { providerId: PROVIDER_ID, kind: 'chart', id: chartId, pluginId: (core.plugin && core.plugin.id) || PROVIDER_ID, data: c },
            title: String(c.title || c.name || ('榜单' + (ci + 1))),
            subtitle: (groupTitle && groupTitle !== String(c.title || c.name) ? groupTitle : (String(c.description || c.subtitle || '').trim())) || undefined,
            capabilities: ['play']
          };
          if (chartArtwork) {
            chartItem.chart = { artworkUrl: String(chartArtwork) };
            chartItem.artworkUrl = String(chartArtwork);
          }
          items.push(chartItem);
        }
      }
      return { items: items };
    } catch (e) { return { items: [] }; }
  }

  async function __mfChartsTracks(resource, cursor, operation) {
    // 真机传 chart ref 本身（data 在 resource.data），旧 mock 传整个对象（resource.ref.data）
    var chartData = resource && resource.data ? resource.data
      : (resource && resource.ref && resource.ref.data);
    if (!chartData) {
      // App 无 context 时用精简 ref（仅 providerId/kind/id/pluginId，无 data）——按 id 反查缓存
      var cid = String((resource && resource.id) || (resource && resource.ref && resource.ref.id) || '');
      if (!cid) return { items: [] };
      chartData = __findChartById(cid);
      if (!chartData) { await __rebuildChartCache(); chartData = __findChartById(cid); }
      if (!chartData) return { items: [] };
    }
    globalThis.__MF_OP__ = operation;
    // cursor 作页码（从 1 开始）
    var page = 1;
    if (cursor !== undefined && cursor !== null && cursor !== '') {
      var pn = parseInt(cursor, 10);
      if (pn > 0) page = pn;
    }
    try {
      var res;
      var list = [];
      var isEnd = true;
      if (plugin.getTopListDetail) {
        res = await plugin.getTopListDetail(chartData, page);
        list = Array.isArray(res) ? res : (res && (res.musicList || res.list || res.data || res.items)) || [];
        isEnd = !!(res && res.isEnd);
      } else if (plugin.getMusicSheet) {
        res = await plugin.getMusicSheet(chartData, page);
        list = Array.isArray(res) ? res : (res && (res.musicList || res.list || res.data || res.items)) || [];
        isEnd = !!(res && res.isEnd);
      }
      var pageOut = { items: list.map(toTrack) };
      if (!isEnd) pageOut.nextCursor = String(page + 1);
      return pageOut;
    } catch (e) { return { items: [] }; }
  }

  // ===== 歌单导入桥接（MF importMusicSheet 一次性 -> Ceru 分页式）=====
  var __sheetCache = {}; // value -> { tracks, name, ts }
  async function __mfImportSheet(request, operation) {
    if (!plugin.importMusicSheet) return { items: [] };
    globalThis.__MF_OP__ = operation;
    var value = String((request && request.value) || '').trim();
    var limit = Math.max(1, Number((request && request.limit) || 100));
    var cursor = String((request && request.cursor) || '');
    if (!value) return { items: [] };
    try {
      // 首次：调用 MF 插件一次性导入，缓存结果
      if (!__sheetCache[value] || Date.now() - __sheetCache[value].ts > 600000) {
        var res = await plugin.importMusicSheet(value);
        var list = Array.isArray(res)
          ? res
          : (res && (res.musicList || res.list || res.items || res.data)) || [];
        var sheetName = (res && (res.name || res.title)) || '';
        __sheetCache[value] = { tracks: list, name: sheetName, ts: Date.now() };
      }
      var cached = __sheetCache[value];
      var offset = cursor ? parseInt(cursor, 10) || 0 : 0;
      var slice = cached.tracks.slice(offset, offset + limit);
      var nextOffset = offset + slice.length;
      var page = { items: slice.map(toTrack) };
      if (nextOffset < cached.tracks.length) page.nextCursor = String(nextOffset);
      if (cached.name && offset === 0) page.name = cached.name;
      return page;
    } catch (e) { return { items: [] }; }
  }

  // ===== 注册 provider =====
  core.providers.register(PROVIDER_ID, {
    tracks: {
      search: async function (request, operation) { return __mfSearch(request, operation); },
      resolve: async function (resource, quality, operation) { return __mfResolve(resource, quality, operation); },
      lyrics: async function (resource, operation) { return __mfLyrics(resource, operation); }
    },
    charts: {
      list: async function (operation) { return __mfChartsList(operation); },
      getTracks: async function (resource, cursor, operation) { return __mfChartsTracks(resource, cursor, operation); }
    }
  });

  // 注册歌单导入器（26 个声明了 importMusicSheet 的插件）
  core.playlistImporters.register(PROVIDER_ID + '-import', {
    getTracks: async function (request, operation) { return __mfImportSheet(request, operation); }
  });
};
