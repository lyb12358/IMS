import { service } from 'src/plugins/axios'

export function getBatchLogList(searchForm) {
    return service({
        url: '/batchLogs',
        method: 'post',
        data: searchForm
    })
}
export function addMatBatchDataSync(id) {
    return service({
        url: '/batch/sync/mat/' + id,
        method: 'post'
    })
}
export function addProdBatchDataSync(id) {
    return service({
        url: '/batch/sync/prod/' + id,
        method: 'post'
    })
}