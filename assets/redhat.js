const $ = window.jQuery

$(function () {
    window.redhatter = true
    const link = $("#supportExceptionLink")[0]
    link.innerHTML = `<a style="background-color: white"
        href="https://tools.apps.cee.redhat.com/support-exceptions/add">
        open a support exception ticket
        </a>`
})