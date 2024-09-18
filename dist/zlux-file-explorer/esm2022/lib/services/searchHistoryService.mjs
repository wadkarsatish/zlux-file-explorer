import { HttpHeaders } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Angular2InjectionTokens } from '../../pluginlib/inject-resources';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
export class SearchHistoryService {
    constructor(pluginDefinition, http) {
        this.pluginDefinition = pluginDefinition;
        this.http = http;
        this.scope = 'user';
        this.resourcePath = 'ui/history';
    }
    onInit(type) {
        this.type = type;
        this.basePlugin = this.pluginDefinition.getBasePlugin();
        this.resourceName = `${type}Search.json`;
        this.uri = ZoweZLUX.uriBroker.pluginConfigForScopeUri(this.basePlugin, this.scope, this.resourcePath, this.resourceName);
        this.searchHistory = [];
        this.getData();
    }
    getData() {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers };
        const getRequest = this.http
            .get(this.uri, options).pipe(catchError((err => {
            let type = this.type;
            console.log(err);
            return null;
        })));
        const sub = getRequest.subscribe((data) => {
            if (data && data.contents && data.contents.history) {
                this.searchHistory = Array.from(new Set(this.searchHistory.concat(data.contents.history)));
            }
            ;
            this.initHistory = true;
            sub.unsubscribe();
        });
    }
    saveData(history) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers };
        let params = {
            "history": history
        };
        return this.http
            .put(this.uri, params, options).pipe(catchError((err => {
            let type = this.type;
            console.log(`save${type}SearchHistory error`, err);
            return null;
        })));
    }
    saveSearchHistory(path) {
        if (path && path.trim() != '' && !this.searchHistory.includes(path)) {
            this.searchHistory.push(path);
            if (this.initHistory) {
                //setTimeout(()=> {
                return this.saveData(this.searchHistory);
                //}, 100); 
            }
            else {
                return of(this.searchHistory);
            }
        }
        return of(this.searchHistory);
    }
    get searchHistoryVal() {
        return this.searchHistory;
    }
    deleteSearchHistory() {
        return this.http.delete(this.uri).pipe(catchError((err => {
            let type = this.type;
            console.log(`delete${type}SearchHistory error`, err);
            return null;
        })));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: SearchHistoryService, deps: [{ token: Angular2InjectionTokens.PLUGIN_DEFINITION }, { token: i1.HttpClient }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: SearchHistoryService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: SearchHistoryService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.PLUGIN_DEFINITION]
                }] }, { type: i1.HttpClient }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoSGlzdG9yeVNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9zZXJ2aWNlcy9zZWFyY2hIaXN0b3J5U2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWMsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFFL0QsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDbkQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDM0UsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUMxQixPQUFPLEVBQUUsVUFBVSxFQUFPLE1BQU0sZ0JBQWdCLENBQUM7OztBQUlqRCxNQUFNLE9BQU8sb0JBQW9CO0lBVy9CLFlBQXVFLGdCQUFnRCxFQUM1RyxJQUFnQjtRQUQ0QyxxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQWdDO1FBQzVHLFNBQUksR0FBSixJQUFJLENBQVk7UUFYbkIsVUFBSyxHQUFXLE1BQU0sQ0FBQztRQUN2QixpQkFBWSxHQUFXLFlBQVksQ0FBQztJQVk1QyxDQUFDO0lBRUQsTUFBTSxDQUFDLElBQVk7UUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLFlBQVksR0FBRyxHQUFHLElBQUksYUFBYSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxHQUFHLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDekgsSUFB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QkFBZ0I7UUFDeEIsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDO0lBQzdCLENBQUM7SUFFTSxtQkFBbUI7UUFDeEIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUNwQyxVQUFVLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNoQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ3JCLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxJQUFJLHFCQUFxQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ3JELE9BQU8sSUFBSSxDQUFBO1FBQ2IsQ0FBQyxDQUFDLENBQUMsQ0FDSixDQUFBO0lBQ0gsQ0FBQzs4R0FoR1Usb0JBQW9CLGtCQVdYLHVCQUF1QixDQUFDLGlCQUFpQjtrSEFYbEQsb0JBQW9COzsyRkFBcEIsb0JBQW9CO2tCQURoQyxVQUFVOzswQkFZSSxNQUFNOzJCQUFDLHVCQUF1QixDQUFDLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBDbGllbnQsIEh0dHBIZWFkZXJzIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IEluamVjdGFibGUsIEluamVjdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBBbmd1bGFyMkluamVjdGlvblRva2VucyB9IGZyb20gJy4uLy4uL3BsdWdpbmxpYi9pbmplY3QtcmVzb3VyY2VzJztcclxuaW1wb3J0IHsgb2YgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgY2F0Y2hFcnJvciwgbWFwIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5cclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIFNlYXJjaEhpc3RvcnlTZXJ2aWNlIHtcclxuICBwcml2YXRlIHNjb3BlOiBzdHJpbmcgPSAndXNlcic7XHJcbiAgcHJpdmF0ZSByZXNvdXJjZVBhdGg6IHN0cmluZyA9ICd1aS9oaXN0b3J5JztcclxuICBwcml2YXRlIGJhc2VQbHVnaW46IFpMVVguUGx1Z2luO1xyXG5cclxuICBwcml2YXRlIHJlc291cmNlTmFtZTogc3RyaW5nO1xyXG4gIHByaXZhdGUgdXJpOiBzdHJpbmc7XHJcbiAgcHVibGljIHNlYXJjaEhpc3Rvcnk6IHN0cmluZ1tdO1xyXG4gIHByaXZhdGUgaW5pdEhpc3Rvcnk6Ym9vbGVhbjsgXHJcbiAgcHJpdmF0ZSB0eXBlOnN0cmluZztcclxuXHJcbiAgY29uc3RydWN0b3IoQEluamVjdChBbmd1bGFyMkluamVjdGlvblRva2Vucy5QTFVHSU5fREVGSU5JVElPTikgcHJpdmF0ZSBwbHVnaW5EZWZpbml0aW9uOiBaTFVYLkNvbnRhaW5lclBsdWdpbkRlZmluaXRpb25cclxuICAsICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQpIHtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgb25Jbml0KHR5cGU6IHN0cmluZykgeyAvLyd1c3MnIG9yICdtdnMnXHJcbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xyXG4gICAgdGhpcy5iYXNlUGx1Z2luID0gdGhpcy5wbHVnaW5EZWZpbml0aW9uLmdldEJhc2VQbHVnaW4oKTtcclxuICAgIHRoaXMucmVzb3VyY2VOYW1lID0gYCR7dHlwZX1TZWFyY2guanNvbmA7XHJcbiAgICB0aGlzLnVyaSA9IFpvd2VaTFVYLnVyaUJyb2tlci5wbHVnaW5Db25maWdGb3JTY29wZVVyaSh0aGlzLmJhc2VQbHVnaW4sIHRoaXMuc2NvcGUsIHRoaXMucmVzb3VyY2VQYXRoLCB0aGlzLnJlc291cmNlTmFtZSk7XHJcbiAgICB0aGlzLnNlYXJjaEhpc3RvcnkgPSBbXTtcclxuICAgIHRoaXMuZ2V0RGF0YSgpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXREYXRhKCk6IHZvaWQge1xyXG5cclxuICAgIGxldCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9KTtcclxuICAgIGxldCBvcHRpb25zID0geyBoZWFkZXJzOiBoZWFkZXJzIH07XHJcblxyXG4gICAgY29uc3QgZ2V0UmVxdWVzdCA9ICB0aGlzLmh0dHBcclxuICAgICAgLmdldCh0aGlzLnVyaSwgb3B0aW9ucykucGlwZShcclxuICAgICAgICBjYXRjaEVycm9yKChlcnIgPT4ge1xyXG4gICAgICAgICAgbGV0IHR5cGUgPSB0aGlzLnR5cGU7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfSkpXHJcbiAgICAgIClcclxuXHJcbiAgICAgIGNvbnN0IHN1YiA9IGdldFJlcXVlc3Quc3Vic2NyaWJlKChkYXRhOmFueSkgPT4ge1xyXG4gICAgICAgIGlmIChkYXRhICYmIGRhdGEuY29udGVudHMgJiYgZGF0YS5jb250ZW50cy5oaXN0b3J5KSB7XHJcbiAgICAgICAgICB0aGlzLnNlYXJjaEhpc3RvcnkgPSBBcnJheS5mcm9tKG5ldyBTZXQodGhpcy5zZWFyY2hIaXN0b3J5LmNvbmNhdChkYXRhLmNvbnRlbnRzLmhpc3RvcnkpKSk7XHJcbiAgICAgICAgfTtcclxuICBcclxuICAgICAgICB0aGlzLmluaXRIaXN0b3J5ID0gdHJ1ZTtcclxuICAgICAgICBzdWIudW5zdWJzY3JpYmUoKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIHNhdmVEYXRhKGhpc3Rvcnk6IHN0cmluZ1tdKTogT2JzZXJ2YWJsZTxhbnk+IHtcclxuXHJcbiAgICBsZXQgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyh7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSk7XHJcbiAgICBsZXQgb3B0aW9ucyA9IHsgaGVhZGVyczogaGVhZGVycyB9O1xyXG5cclxuICAgIGxldCBwYXJhbXMgPSB7XHJcbiAgICAgICAgXCJoaXN0b3J5XCI6IGhpc3RvcnlcclxuICAgIH07XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuaHR0cFxyXG4gICAgICAucHV0KHRoaXMudXJpLCBwYXJhbXMsIG9wdGlvbnMpLnBpcGUoXHJcbiAgICAgICAgY2F0Y2hFcnJvcigoZXJyID0+IHtcclxuICAgICAgICAgIGxldCB0eXBlID0gdGhpcy50eXBlO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coYHNhdmUke3R5cGV9U2VhcmNoSGlzdG9yeSBlcnJvcmAsIGVycik7XHJcbiAgICAgICAgICByZXR1cm4gbnVsbFxyXG4gICAgICAgIH0pKVxyXG4gICAgICApXHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2F2ZVNlYXJjaEhpc3RvcnkocGF0aDogc3RyaW5nKTpPYnNlcnZhYmxlPGFueT4ge1xyXG4gICAgaWYgKHBhdGggJiYgcGF0aC50cmltKCkgIT0gJycgJiYgIXRoaXMuc2VhcmNoSGlzdG9yeS5pbmNsdWRlcyhwYXRoKSkge1xyXG4gICAgICB0aGlzLnNlYXJjaEhpc3RvcnkucHVzaChwYXRoKTtcclxuICAgICAgaWYodGhpcy5pbml0SGlzdG9yeSkge1xyXG4gICAgICAgIC8vc2V0VGltZW91dCgoKT0+IHtcclxuICAgICAgICByZXR1cm4gdGhpcy5zYXZlRGF0YSh0aGlzLnNlYXJjaEhpc3RvcnkpO1xyXG4gICAgICAgIC8vfSwgMTAwKTsgXHJcbiAgICAgIH0gXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBvZih0aGlzLnNlYXJjaEhpc3RvcnkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9mKHRoaXMuc2VhcmNoSGlzdG9yeSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgZ2V0IHNlYXJjaEhpc3RvcnlWYWwoKTpzdHJpbmdbXSB7XHJcbiAgICAgcmV0dXJuIHRoaXMuc2VhcmNoSGlzdG9yeTtcclxuICB9XHJcblxyXG4gIHB1YmxpYyBkZWxldGVTZWFyY2hIaXN0b3J5KCk6T2JzZXJ2YWJsZTxhbnk+IHtcclxuICAgIHJldHVybiB0aGlzLmh0dHAuZGVsZXRlKHRoaXMudXJpKS5waXBlKFxyXG4gICAgICBjYXRjaEVycm9yKChlcnIgPT4ge1xyXG4gICAgICAgIGxldCB0eXBlID0gdGhpcy50eXBlO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGBkZWxldGUke3R5cGV9U2VhcmNoSGlzdG9yeSBlcnJvcmAsIGVycik7XHJcbiAgICAgICAgcmV0dXJuIG51bGxcclxuICAgICAgfSkpXHJcbiAgICApXHJcbiAgfVxyXG5cclxufSJdfQ==