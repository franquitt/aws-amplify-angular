import { Component } from '@angular/core';
import { Amplify, Auth } from 'aws-amplify';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  title = 'aws-amplify-cognito-authentication';
  username= 'franco+10@icanotes.com';
  password = '?Aws_Amplify21!';
  mfaPin = '';
  mfaUser: any;
  secretCode = 'FM42YTNJNW46HXOE3MS67ICRLSG3LCSJADCZ7GO6DH5UPBNYYQDA';
  rememberDevice: any;
  mfaDevices: any;
  showMfaFlow = false;

  ngOnInit(){
    console.log("hola")
    Amplify.configure({
      aws_project_region: 'us-west-2', // eslint-disable-line @typescript-eslint/naming-convention
      aws_cognito_region: 'us-west-2', // eslint-disable-line @typescript-eslint/naming-convention
      aws_user_pools_id: 'us-west-2_Y9cQRbuHH', // eslint-disable-line @typescript-eslint/naming-convention
      aws_user_pools_web_client_id: '4v3mifa61ok255bhl23to0h3dd', // eslint-disable-line @typescript-eslint/naming-convention
    });
  }

  public async login(){
    try{
        this.showMfaFlow = false;
        if(!this.mfaUser)
          this.mfaUser = await Auth.signIn(this.username, this.password);
        console.log(this.mfaUser);
        if(this.mfaUser.challengeName === "SOFTWARE_TOKEN_MFA"){
          this.showMfaFlow = true;
          if(!this.mfaPin){
            alert('insert pin code')
            return;
          }
          this.mfaUser = await Auth.confirmSignIn(
            this.mfaUser,
            this.mfaPin,
            this.mfaUser.challengeName
          );
          console.log(this.mfaUser);
          if(this.rememberDevice){
            let result = await Auth.rememberDevice();
            console.log(result)
          }
         
        }
        await this.getDevices();
        
        
        //this.secretCode = await Auth.setupTOTP(this.mfaUser);
          /*Auth.completeNewPassword(this.mfaUser, '?Aws_Amplify21!').then(user=>{
          console.log(user)
        });
      */
     alert("Great!")
    }catch(error: any){
      if(error.code){
        alert(error.code)
      }
      console.log(error);
      this.mfaUser = null;
    }
  }
  public async getDevices(){
    this.mfaDevices = await Auth.fetchDevices();
    console.log(this.mfaDevices);
  }
  public async deleteDevice(){
    console.log("Forget device")
    let result = await Auth.forgetDevice();    
    console.log(result);
    this.getDevices();
  }

  async logout(){
    const result = await Auth.signOut();
    console.log(result)
    this.mfaUser = null;
    this.showMfaFlow = false;
  }
}
