import { BasePage } from './basePage';

export class PimPage extends BasePage {
  private addEmployeeButton = 'button:has-text("Add")';
  private firstNameInput = 'input[name="firstName"]';
  private lastNameInput = 'input[name="lastName"]';
  private saveButton = 'button[type="submit"]';
  private employeeList = '.oxd-table-body';
  private editButtonSelector = (employeeId: string) => `//div[contains(text(),'${employeeId}')]//following-sibling::div/button[has-text('Edit')]`;
  private deleteButtonSelector = (employeeId: string) => `//div[contains(text(),'${employeeId}')]//following-sibling::div/button[has-text('Delete')]`;

  async addEmployee(firstName: string, lastName: string) {
    await this.page.click(this.addEmployeeButton);
    await this.page.fill(this.firstNameInput, firstName);
    await this.page.fill(this.lastNameInput, lastName);
    await this.page.click(this.saveButton);
    // Extract employee ID from URL or toast message if needed
  }

  async editEmployee(employeeId: string, newFirstName: string) {
    await this.page.click(this.editButtonSelector(employeeId));
    await this.page.fill(this.firstNameInput, newFirstName);
    await this.page.click(this.saveButton);
  }

  async deleteEmployee(employeeId: string) {
    await this.page.click(this.deleteButtonSelector(employeeId));
    await this.page.click('button:has-text("Yes, Delete")');
  }

  async validateEmployeeInTable(employeeName: string) {
    return await this.page.isVisible(`//div[contains(text(),'${employeeName}')]`);
  }
}