#!/bin/pwsh
param($userPoolId)
$users = (aws cognito-idp list-users --user-pool-id  $userPoolId | ConvertFrom-Json).users
$users | Select-Object username -expand username | ForEach-Object { aws cognito-idp admin-delete-user --user-pool-id $userPoolId --username $_ }
