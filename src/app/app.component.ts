import { Component } from '@angular/core';
import { Amplify, Auth } from 'aws-amplify';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  title = 'aws-amplify-cognito-authentication';
  username = 'franco+2@icanotes.com';
  masterPassword = '?Aws_Amplify21!';
  password = this.masterPassword;
  mfaPin = '';
  mfaPinSetup = '';
  mfaUser: any;
  secretCode = '';
  rememberDevice: any;
  rememberDeviceSetup: any;
  mfaDevices: any;
  showMfaFlow = false;
  showMfaSetupFlow = false;
  isLoggedIn = false;


  ngOnInit() {
    Amplify.configure({
      aws_project_region: 'us-west-2', // eslint-disable-line @typescript-eslint/naming-convention
      aws_cognito_region: 'us-west-2', // eslint-disable-line @typescript-eslint/naming-convention
      aws_user_pools_id: 'us-west-2_ZGlUWMaRf', // eslint-disable-line @typescript-eslint/naming-convention
      aws_user_pools_web_client_id: '1e591fapeovp5482aucej699gg', // eslint-disable-line @typescript-eslint/naming-convention
    });
  }


  public async login() {
    try {
      this.showMfaFlow = false;
      if (!this.mfaUser)
        this.mfaUser = await Auth.signIn(this.username, this.password);
      console.log(this.mfaUser);
      if (this.mfaUser.challengeName === "NEW_PASSWORD_REQUIRED") {
        const result = await Auth.completeNewPassword(this.mfaUser, this.masterPassword,
          {
            name: "franco",
          });
        console.log("password reset result", result);
        alert("Password changed!");
        this.password = this.masterPassword;
        this.logout();
        return;
      } else if (this.mfaUser.challengeName === "SOFTWARE_TOKEN_MFA") {
        this.showMfaFlow = true;
        return;
      } else if (this.mfaUser.preferredMFA === "NOMFA") {
        this.mfaSetup();
        return;
      } else {
        console.log("else with ", this.mfaUser.challengeName)
        this.loggedIn();
      }
    } catch (error: any) {
      if (error.code) {
        alert(error.code)
      }
      console.log(error);
      this.mfaUser = null;
    }
  }


  public async mfaSetup() {
    this.showMfaSetupFlow = true;
    try {
      this.secretCode = await Auth.setupTOTP(this.mfaUser);
    } catch (err) {
      console.log("error setting up mfa", err);
    }
  }


  public async verifyTOPT() {
    try {
      if (!this.mfaPinSetup) {
        alert('insert pin code')
        return;
      }
      let result = await Auth.verifyTotpToken(this.mfaUser, this.mfaPinSetup) as any;
      console.log("verifyTOPT result", result);
      result = await Auth.setPreferredMFA(this.mfaUser, 'TOTP');
      console.log("setPreferredMFA result", result);
      if (this.rememberDeviceSetup) {
        let result = await Auth.rememberDevice();
        console.log("rememberDeviceSetup", result)
      }
      this.loggedIn();
      this.showMfaSetupFlow = false;
    } catch (err) {
      console.log("error verifying TOPT", err)
      this.logout();
    }

  }


  public async resetMFA() {
    try {
      let result = await Auth.setPreferredMFA(this.mfaUser, 'NOMFA');
      console.log("setPreferredMFA result", result);
    } catch (err) {
      console.log("error resetMFA", err)

    }
    this.logout();
  }


  public async loggedIn() {
    if (this.mfaUser)
      await this.getDevices();
    alert("Logged-In!")
    this.isLoggedIn = true;
  }


  public async verifyLogin() {
    if (!this.mfaPin) {
      alert('insert pin code')
      return;
    }
    this.mfaUser = await Auth.confirmSignIn(
      this.mfaUser,
      this.mfaPin,
      this.mfaUser.challengeName
    );
    console.log(this.mfaUser);
    if (this.rememberDevice) {
      let result = await Auth.rememberDevice();
      console.log(result)
    }
    this.loggedIn();
  }


  public async getDevices() {
    this.mfaDevices = await Auth.fetchDevices();
    console.log("devices", this.mfaDevices);
  }


  public async deleteDevice() {
    console.log("Forget device")
    let result = await Auth.forgetDevice();
    console.log(result);
    this.getDevices();
  }


  async logout() {
    const result = await Auth.signOut();
    console.log(result)
    this.mfaUser = null;
    this.showMfaFlow = false;
    this.mfaDevices = [];
    this.mfaPin = '';
    this.isLoggedIn = false;
  }
}
