exports.manifest = {
  manifestVersion: 2,
  id: 'ceru.diag.http',
  name: 'HTTP诊断',
  version: '1.0.0',
  description: '诊断真机原生HTTP层POST行为',
  engines: { hostApi: '^2.0.0', logicRuntime: 'ceru-js@1' },
  modules: { logic: { entry: 'logic.main' } },
  contributes: {
    providers: [{ id: 'diag', name: 'HTTP诊断', protocols: ['music.search@1'], qualities: ['128k'], connectionMode: 'none' }]
  },
  permissions: [{ key: 'network', name: 'network.request', reason: '诊断网络' }]
};
exports.activate = function (core) {
  core.providers.register('diag', {
    tracks: {
      search: async function (request, operation) {
        var out = [];
        function row(title, sub) {
          out.push({
            ref: { providerId: 'diag', kind: 'track', id: 'd' + out.length, scope: 'provider' },
            title: String(title), subtitle: String(sub || ''), capabilities: [],
            metadata: { artists: ['diag'] }
          });
        }
        row('DIAG-START', 'op=' + !!operation + ' signal=' + !!(operation && operation.signal));
        try {
          var body = JSON.stringify({
            comm: { ct: '24', cv: '0' },
            req: { module: 'music.adaptor.SearchAdaptor', method: 'do_search_v2',
              param: { query: '雨后初晴', search_type: 0, page_num: 1, num_per_page: 20 } }
          });
          var res = await core.http.request({
            permissionKey: 'network',
            url: 'https://u.y.qq.com/cgi-bin/musicu.fcg',
            method: 'POST',
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Referer': 'https://y.qq.com/', 'Content-Type': 'application/json;charset=utf-8' },
            body: body,
            timeoutMs: 20000,
            operation: operation
          });
          row('HTTP-OK', 'status=' + res.status + ' bodyType=' + typeof res.body);
          var b = res.body;
          if (typeof b === 'string') { try { b = JSON.parse(b); row('PARSED', 'json ok'); } catch (e) { row('PARSED', 'json FAIL ' + e.message); } }
          var bd = b && b.req && b.req.data && b.req.data.body;
          row('BODY-KEYS', bd ? Object.keys(bd).slice(0, 8).join(',') : 'NO BODY');
          var its = bd && bd.item_song && bd.item_song.items;
          row('item_song', its ? its.length + ' items' : 'MISSING');
          row('direct_result', bd && bd.direct_result ? 'PRESENT' : 'MISSING');
          if (its && its.length) row('FIRST', String((its[0] && its[0].name) || '?').slice(0, 30));
          row('REQ-CODE', String(b && b.req && b.req.code));
        } catch (e) {
          row('HTTP-ERR', String(e && e.message).slice(0, 60));
        }
        return { items: out };
      }
    }
  });
};
