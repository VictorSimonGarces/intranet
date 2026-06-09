import { Page } from "@playwright/test";

export class NavigateTo{

    private readonly page:Page

    constructor(page: Page){
        this.page = page
    }

    async loginPage(){
        await this.page.goto('http://127.0.0.1:5500/login/login.html')
    }

}