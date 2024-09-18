/*
This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
*/
export function getExtension(name) {
    if (name.split('.').length > 1) {
        let extension = name.split('.')[name.split('.').length - 1];
        let index = name.lastIndexOf('.');
        return name.slice(index);
    }
    return '';
}
export function getBaseName(name) {
    if (name.split('.').length > 1) {
        let extension = name.split('.')[name.split('.').length - 1];
        let index = name.lastIndexOf('.');
        return name.slice(0, index);
    }
    return name;
}
export function incrementFileName(name) {
    let extSuffix = this.getExtension(name);
    let namePrefix = this.getBaseName(name);
    // name copy 5(.txt) => name copy 6(.txt)
    // name copy(.txt) => name copy 2(.txt)
    const suffixRegex = /^(.+ copy)( \d+)?$/;
    if (suffixRegex.test(namePrefix)) {
        return namePrefix.replace(suffixRegex, (match, g1, g2) => {
            let number = (g2 ? parseInt(g2) : 1);
            return number === 0
                ? `${g1}`
                : (number < 888
                    ? `${g1} ${number + 1}`
                    : `${g1}${g2} copy`);
        }) + extSuffix;
    }
    // name(.txt) => name copy(.txt)
    return `${namePrefix} copy${extSuffix}`;
}
/*
This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
*/
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZUFjdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9zaGFyZWQvZmlsZUFjdGlvbnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7Ozs7Ozs7O0VBUUU7QUFHRixNQUFNLFVBQVUsWUFBWSxDQUFDLElBQVc7SUFDdEMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMvQixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFDRCxPQUFPLEVBQUUsQ0FBQztBQUNaLENBQUM7QUFFRCxNQUFNLFVBQVUsV0FBVyxDQUFDLElBQVc7SUFDckMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUMvQixJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzVELElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDbEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsTUFBTSxVQUFVLGlCQUFpQixDQUFDLElBQVk7SUFDMUMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRXhDLHlDQUF5QztJQUN6Qyx1Q0FBdUM7SUFDdkMsTUFBTSxXQUFXLEdBQUcsb0JBQW9CLENBQUM7SUFDekMsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7UUFDakMsT0FBTyxVQUFVLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFHLEVBQUUsRUFBRyxFQUFFLEVBQUU7WUFDekQsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMsT0FBTyxNQUFNLEtBQUssQ0FBQztnQkFDakIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUNULENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxHQUFHO29CQUNiLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUN2QixDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzQixDQUFDLENBQUMsR0FBRyxTQUFTLENBQUM7SUFDakIsQ0FBQztJQUVELGdDQUFnQztJQUNoQyxPQUFPLEdBQUcsVUFBVSxRQUFRLFNBQVMsRUFBRSxDQUFDO0FBQzVDLENBQUM7QUFLRDs7Ozs7Ozs7RUFRRSIsInNvdXJjZXNDb250ZW50IjpbIlxyXG5cclxuLypcclxuVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxubWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxudGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXHJcblxyXG5TUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG5cclxuQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4qL1xyXG5cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRFeHRlbnNpb24obmFtZTpzdHJpbmcpOnN0cmluZ3tcclxuICBpZiAobmFtZS5zcGxpdCgnLicpLmxlbmd0aCA+IDEpIHtcclxuICAgIGxldCBleHRlbnNpb24gPSBuYW1lLnNwbGl0KCcuJylbbmFtZS5zcGxpdCgnLicpLmxlbmd0aCAtIDFdO1xyXG4gICAgbGV0IGluZGV4ID0gbmFtZS5sYXN0SW5kZXhPZignLicpO1xyXG4gICAgcmV0dXJuIG5hbWUuc2xpY2UoaW5kZXgpO1xyXG4gIH1cclxuICByZXR1cm4gJyc7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRCYXNlTmFtZShuYW1lOnN0cmluZyk6c3RyaW5ne1xyXG4gIGlmIChuYW1lLnNwbGl0KCcuJykubGVuZ3RoID4gMSkge1xyXG4gICAgbGV0IGV4dGVuc2lvbiA9IG5hbWUuc3BsaXQoJy4nKVtuYW1lLnNwbGl0KCcuJykubGVuZ3RoIC0gMV07XHJcbiAgICBsZXQgaW5kZXggPSBuYW1lLmxhc3RJbmRleE9mKCcuJyk7XHJcbiAgICByZXR1cm4gbmFtZS5zbGljZSgwLGluZGV4KTtcclxuICB9XHJcbiAgcmV0dXJuIG5hbWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpbmNyZW1lbnRGaWxlTmFtZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgbGV0IGV4dFN1ZmZpeCA9IHRoaXMuZ2V0RXh0ZW5zaW9uKG5hbWUpO1xyXG4gICAgbGV0IG5hbWVQcmVmaXggPSB0aGlzLmdldEJhc2VOYW1lKG5hbWUpO1xyXG5cclxuICAgIC8vIG5hbWUgY29weSA1KC50eHQpID0+IG5hbWUgY29weSA2KC50eHQpXHJcbiAgICAvLyBuYW1lIGNvcHkoLnR4dCkgPT4gbmFtZSBjb3B5IDIoLnR4dClcclxuICAgIGNvbnN0IHN1ZmZpeFJlZ2V4ID0gL14oLisgY29weSkoIFxcZCspPyQvO1xyXG4gICAgaWYgKHN1ZmZpeFJlZ2V4LnRlc3QobmFtZVByZWZpeCkpIHtcclxuICAgICAgcmV0dXJuIG5hbWVQcmVmaXgucmVwbGFjZShzdWZmaXhSZWdleCwgKG1hdGNoLCBnMT8sIGcyPykgPT4ge1xyXG4gICAgICAgIGxldCBudW1iZXIgPSAoZzIgPyBwYXJzZUludChnMikgOiAxKTtcclxuICAgICAgICByZXR1cm4gbnVtYmVyID09PSAwXHJcbiAgICAgICAgICA/IGAke2cxfWBcclxuICAgICAgICAgIDogKG51bWJlciA8IDg4OFxyXG4gICAgICAgICAgICA/IGAke2cxfSAke251bWJlciArIDF9YFxyXG4gICAgICAgICAgICA6IGAke2cxfSR7ZzJ9IGNvcHlgKTtcclxuICAgICAgfSkgKyBleHRTdWZmaXg7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gbmFtZSgudHh0KSA9PiBuYW1lIGNvcHkoLnR4dClcclxuICAgIHJldHVybiBgJHtuYW1lUHJlZml4fSBjb3B5JHtleHRTdWZmaXh9YDtcclxufVxyXG5cclxuXHJcblxyXG5cclxuLypcclxuVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxubWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxudGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXHJcblxyXG5TUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG5cclxuQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4qL1xyXG5cclxuIl19