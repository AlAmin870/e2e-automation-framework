import { BasePage } from './basePage';

export class DashboardPage extends BasePage {
  private welcomeMessage = 'p.oxd-userdropdown-name';

  async getWelcomeText() {
    return await this.page.textContent(this.welcomeMessage);
  }

  async logout() {
    await this.page.click('.oxd-userdropdown');
    await this.page.click('text=Logout');
  }
}