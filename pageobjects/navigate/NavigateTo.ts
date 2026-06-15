import { Page } from "@playwright/test";

export class NavigateTo{

    private readonly page:Page

    constructor(page: Page){
        this.page = page
    }

    async loginPage(){
        await this.page.goto('http://127.0.0.1:5501/login/login.html')
    }

    async intranetPage(){
        await this.page.goto('https://intranet_dev.es.deloitte.com/')
    }

    async youtubePage(){
        await this.page.goto('https://www.youtube.com/')
    }
}