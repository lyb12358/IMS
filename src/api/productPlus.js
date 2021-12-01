import { service } from 'src/plugins/axios'


export function codeExport(searchForm) {
    return service({
        url: '/excel/prodCodes',
        method: 'post',
        responseType: 'blob',
        data: searchForm
    })
}
export function specDownload(id) {
    return service({
        url: '/specs/' + id,
        method: 'get',
        responseType: 'blob'
    })
}
export function importModelDownload(name) {
    return service({
        url: '/importModel/' + name,
        method: 'get',
        responseType: 'blob'
    })
}

export function recordDetailImage(id,type,location) {
    return service({
        url: '/product/detailImage',
        method: 'post',
        params: {id,type,location}
    })
}





