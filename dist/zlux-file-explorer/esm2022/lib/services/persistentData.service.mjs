import { Injectable, Inject } from '@angular/core';
import { Angular2InjectionTokens } from '../../pluginlib/inject-resources';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
export class PersistentDataService {
    constructor(http, pluginDefinition) {
        this.http = http;
        this.pluginDefinition = pluginDefinition;
        this.scope = "instance";
        this.resourcePath = "persistance";
        this.fileName = "zlux-file-explorer.json";
    }
    setData(params) {
        let uri = ZoweZLUX.uriBroker.pluginConfigForScopeUri(this.pluginDefinition.getBasePlugin(), this.scope, this.resourcePath, this.fileName);
        if (typeof params === 'object') {
            return this.http.put(uri, this.stringify(params, null, 2, null));
            //return this.http.put(uri, JSON.stringify(params));
        }
        else {
            return this.http.put(uri, params);
        }
    }
    getData() {
        return null;
        //TODO: This code no longer functions as intended. This is supposed to introduce persistent data loading
        //so the File Explorer would re-open a user's previously opened trees/working directory when they close.
        // let uri = ZoweZLUX.uriBroker.pluginConfigForScopeUri(this.pluginDefinition.getBasePlugin(), this.scope, this.resourcePath, this.fileName);
        // let headers = new Headers({ 'Content-Type': 'application/json' });
        // let options = new RequestOptions({ headers: headers });
        // return this.http
        // .get(uri, options)
        // .map((res => { return res.json(); }))
        // .catch((err => { 
        //   console.log("Data saving file does not exist. Creating one now...");
        //   return this.http.put(uri, this.stringify(null, null, 2, null)); 
        // })); 
    }
    stringify(obj, replacer, spaces, cycleReplacer) {
        return JSON.stringify(obj, this.serializer(replacer, cycleReplacer), spaces);
    }
    serializer(replacer, cycleReplacer) {
        var stack = [], keys = [];
        if (cycleReplacer == null)
            cycleReplacer = function (key, value) {
                if (stack[0] === value)
                    return "[Circular ~]";
                return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
            };
        return function (key, value) {
            if (stack.length > 0) {
                var thisPos = stack.indexOf(this);
                ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
                ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
                if (~stack.indexOf(value))
                    value = cycleReplacer.call(this, key, value);
            }
            else
                stack.push(value);
            return replacer == null ? value : replacer.call(this, key, value);
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: PersistentDataService, deps: [{ token: i1.HttpClient }, { token: Angular2InjectionTokens.PLUGIN_DEFINITION }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: PersistentDataService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: PersistentDataService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.PLUGIN_DEFINITION]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGVyc2lzdGVudERhdGEuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3psdXgtZmlsZS1leHBsb3Jlci9zcmMvbGliL3NlcnZpY2VzL3BlcnNpc3RlbnREYXRhLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBYUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHbkQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sa0NBQWtDLENBQUM7OztBQUczRSxNQUFNLE9BQU8scUJBQXFCO0lBTTlCLFlBQW9CLElBQWdCLEVBQzJCLGdCQUFnRDtRQUQzRixTQUFJLEdBQUosSUFBSSxDQUFZO1FBQzJCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBZ0M7UUFMdkcsVUFBSyxHQUFXLFVBQVUsQ0FBQztRQUMzQixpQkFBWSxHQUFXLGFBQWEsQ0FBQztRQUNyQyxhQUFRLEdBQVcseUJBQXlCLENBQUE7SUFLaEQsQ0FBQztJQUVFLE9BQU8sQ0FBQyxNQUFXO1FBRXRCLElBQUksR0FBRyxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFFMUksSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUM3QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakUsb0RBQW9EO1FBQ3hELENBQUM7YUFBTSxDQUFDO1lBQ0osT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDdEMsQ0FBQztJQUNMLENBQUM7SUFHTSxPQUFPO1FBQ1osT0FBTyxJQUFJLENBQUM7UUFDVix3R0FBd0c7UUFDeEcsd0dBQXdHO1FBRXhHLDZJQUE2STtRQUU3SSxxRUFBcUU7UUFDckUsMERBQTBEO1FBQzFELG1CQUFtQjtRQUNuQixxQkFBcUI7UUFDckIsd0NBQXdDO1FBQ3hDLG9CQUFvQjtRQUNwQix5RUFBeUU7UUFDekUscUVBQXFFO1FBQ3JFLFFBQVE7SUFDWixDQUFDO0lBRU0sU0FBUyxDQUFDLEdBQUcsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWE7UUFDakQsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxhQUFhLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQTtJQUM5RSxDQUFDO0lBRUksVUFBVSxDQUFDLFFBQVEsRUFBRSxhQUFhO1FBQ3JDLElBQUksS0FBSyxHQUFHLEVBQUUsRUFBRSxJQUFJLEdBQUcsRUFBRSxDQUFBO1FBRXpCLElBQUksYUFBYSxJQUFJLElBQUk7WUFBRSxhQUFhLEdBQUcsVUFBUyxHQUFHLEVBQUUsS0FBSztnQkFDNUQsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSztvQkFBRSxPQUFPLGNBQWMsQ0FBQTtnQkFDN0MsT0FBTyxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLENBQUE7WUFDN0UsQ0FBQyxDQUFBO1FBRUQsT0FBTyxVQUFTLEdBQUcsRUFBRSxLQUFLO1lBQ3hCLElBQUksS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDckIsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtnQkFDakMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFBO2dCQUN2RCxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsUUFBUSxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUMvRCxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7b0JBQUUsS0FBSyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQTtZQUN6RSxDQUFDOztnQkFDSSxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO1lBRXRCLE9BQU8sUUFBUSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUE7UUFDbkUsQ0FBQyxDQUFBO0lBQ0gsQ0FBQzs4R0FqRU0scUJBQXFCLDRDQU9sQix1QkFBdUIsQ0FBQyxpQkFBaUI7a0hBUDVDLHFCQUFxQjs7MkZBQXJCLHFCQUFxQjtrQkFEakMsVUFBVTs7MEJBUUYsTUFBTTsyQkFBQyx1QkFBdUIsQ0FBQyxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuLypcclxuICBUaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxyXG4gIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXHJcbiAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXHJcbiAgXHJcbiAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcclxuICBcclxuICBDb3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXHJcbiovXHJcblxyXG5pbXBvcnQgeyBUcmVlTm9kZSB9IGZyb20gJ3ByaW1lbmcvYXBpJztcclxuXHJcbmltcG9ydCB7IEluamVjdGFibGUsIEluamVjdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwUmVzcG9uc2UsIEh0dHBIZWFkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IEFuZ3VsYXIySW5qZWN0aW9uVG9rZW5zIH0gZnJvbSAnLi4vLi4vcGx1Z2lubGliL2luamVjdC1yZXNvdXJjZXMnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgUGVyc2lzdGVudERhdGFTZXJ2aWNlIHtcclxuICAgIHByaXZhdGUgdXNzRGF0YTogVHJlZU5vZGVbXTtcclxuICAgIHByaXZhdGUgc2NvcGU6IHN0cmluZyA9IFwiaW5zdGFuY2VcIjtcclxuICAgIHByaXZhdGUgcmVzb3VyY2VQYXRoOiBzdHJpbmcgPSBcInBlcnNpc3RhbmNlXCI7XHJcbiAgICBwcml2YXRlIGZpbGVOYW1lOiBzdHJpbmcgPSBcInpsdXgtZmlsZS1leHBsb3Jlci5qc29uXCJcclxuICAgIFxyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LFxyXG4gICAgICAgIEBJbmplY3QoQW5ndWxhcjJJbmplY3Rpb25Ub2tlbnMuUExVR0lOX0RFRklOSVRJT04pIHByaXZhdGUgcGx1Z2luRGVmaW5pdGlvbjogWkxVWC5Db250YWluZXJQbHVnaW5EZWZpbml0aW9uLFxyXG5cclxuICAgICkgeyB9XHJcblxyXG4gICAgcHVibGljIHNldERhdGEocGFyYW1zOiBhbnkpOiBPYnNlcnZhYmxlPGFueT4ge1xyXG5cclxuICAgICAgICBsZXQgdXJpID0gWm93ZVpMVVgudXJpQnJva2VyLnBsdWdpbkNvbmZpZ0ZvclNjb3BlVXJpKHRoaXMucGx1Z2luRGVmaW5pdGlvbi5nZXRCYXNlUGx1Z2luKCksIHRoaXMuc2NvcGUsIHRoaXMucmVzb3VyY2VQYXRoLCB0aGlzLmZpbGVOYW1lKTtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBwYXJhbXMgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmh0dHAucHV0KHVyaSwgdGhpcy5zdHJpbmdpZnkocGFyYW1zLCBudWxsLCAyLCBudWxsKSk7XHJcbiAgICAgICAgICAgIC8vcmV0dXJuIHRoaXMuaHR0cC5wdXQodXJpLCBKU09OLnN0cmluZ2lmeShwYXJhbXMpKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5odHRwLnB1dCh1cmksIHBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICBwdWJsaWMgZ2V0RGF0YSgpOiBPYnNlcnZhYmxlPGFueT4ge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAvL1RPRE86IFRoaXMgY29kZSBubyBsb25nZXIgZnVuY3Rpb25zIGFzIGludGVuZGVkLiBUaGlzIGlzIHN1cHBvc2VkIHRvIGludHJvZHVjZSBwZXJzaXN0ZW50IGRhdGEgbG9hZGluZ1xyXG4gICAgICAgIC8vc28gdGhlIEZpbGUgRXhwbG9yZXIgd291bGQgcmUtb3BlbiBhIHVzZXIncyBwcmV2aW91c2x5IG9wZW5lZCB0cmVlcy93b3JraW5nIGRpcmVjdG9yeSB3aGVuIHRoZXkgY2xvc2UuXHJcblxyXG4gICAgICAgIC8vIGxldCB1cmkgPSBab3dlWkxVWC51cmlCcm9rZXIucGx1Z2luQ29uZmlnRm9yU2NvcGVVcmkodGhpcy5wbHVnaW5EZWZpbml0aW9uLmdldEJhc2VQbHVnaW4oKSwgdGhpcy5zY29wZSwgdGhpcy5yZXNvdXJjZVBhdGgsIHRoaXMuZmlsZU5hbWUpO1xyXG5cclxuICAgICAgICAvLyBsZXQgaGVhZGVycyA9IG5ldyBIZWFkZXJzKHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcclxuICAgICAgICAvLyBsZXQgb3B0aW9ucyA9IG5ldyBSZXF1ZXN0T3B0aW9ucyh7IGhlYWRlcnM6IGhlYWRlcnMgfSk7XHJcbiAgICAgICAgLy8gcmV0dXJuIHRoaXMuaHR0cFxyXG4gICAgICAgIC8vIC5nZXQodXJpLCBvcHRpb25zKVxyXG4gICAgICAgIC8vIC5tYXAoKHJlcyA9PiB7IHJldHVybiByZXMuanNvbigpOyB9KSlcclxuICAgICAgICAvLyAuY2F0Y2goKGVyciA9PiB7IFxyXG4gICAgICAgIC8vICAgY29uc29sZS5sb2coXCJEYXRhIHNhdmluZyBmaWxlIGRvZXMgbm90IGV4aXN0LiBDcmVhdGluZyBvbmUgbm93Li4uXCIpO1xyXG4gICAgICAgIC8vICAgcmV0dXJuIHRoaXMuaHR0cC5wdXQodXJpLCB0aGlzLnN0cmluZ2lmeShudWxsLCBudWxsLCAyLCBudWxsKSk7IFxyXG4gICAgICAgIC8vIH0pKTsgXHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHN0cmluZ2lmeShvYmosIHJlcGxhY2VyLCBzcGFjZXMsIGN5Y2xlUmVwbGFjZXIpIHtcclxuICAgICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkob2JqLCB0aGlzLnNlcmlhbGl6ZXIocmVwbGFjZXIsIGN5Y2xlUmVwbGFjZXIpLCBzcGFjZXMpXHJcbiAgICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2VyaWFsaXplcihyZXBsYWNlciwgY3ljbGVSZXBsYWNlcikge1xyXG4gICAgICAgIHZhciBzdGFjayA9IFtdLCBrZXlzID0gW11cclxuICAgICAgXHJcbiAgICAgICAgaWYgKGN5Y2xlUmVwbGFjZXIgPT0gbnVsbCkgY3ljbGVSZXBsYWNlciA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcclxuICAgICAgICAgIGlmIChzdGFja1swXSA9PT0gdmFsdWUpIHJldHVybiBcIltDaXJjdWxhciB+XVwiXHJcbiAgICAgICAgICByZXR1cm4gXCJbQ2lyY3VsYXIgfi5cIiArIGtleXMuc2xpY2UoMCwgc3RhY2suaW5kZXhPZih2YWx1ZSkpLmpvaW4oXCIuXCIpICsgXCJdXCJcclxuICAgICAgICB9XHJcbiAgICAgIFxyXG4gICAgICAgIHJldHVybiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICBpZiAoc3RhY2subGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICB2YXIgdGhpc1BvcyA9IHN0YWNrLmluZGV4T2YodGhpcylcclxuICAgICAgICAgICAgfnRoaXNQb3MgPyBzdGFjay5zcGxpY2UodGhpc1BvcyArIDEpIDogc3RhY2sucHVzaCh0aGlzKVxyXG4gICAgICAgICAgICB+dGhpc1BvcyA/IGtleXMuc3BsaWNlKHRoaXNQb3MsIEluZmluaXR5LCBrZXkpIDoga2V5cy5wdXNoKGtleSlcclxuICAgICAgICAgICAgaWYgKH5zdGFjay5pbmRleE9mKHZhbHVlKSkgdmFsdWUgPSBjeWNsZVJlcGxhY2VyLmNhbGwodGhpcywga2V5LCB2YWx1ZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Ugc3RhY2sucHVzaCh2YWx1ZSlcclxuICAgICAgXHJcbiAgICAgICAgICByZXR1cm4gcmVwbGFjZXIgPT0gbnVsbCA/IHZhbHVlIDogcmVwbGFjZXIuY2FsbCh0aGlzLCBrZXksIHZhbHVlKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIFxyXG59XHJcblxyXG5cclxuXHJcblxyXG5cclxuXHJcbi8qXHJcbiAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxuICBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xyXG4gIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxyXG4gIFxyXG4gIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXHJcbiAgXHJcbiAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4qL1xyXG4iXX0=