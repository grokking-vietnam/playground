## Pulumi Fundamentals Tutorial

![Build and ship faster with infrastructure as code](https://www.pulumi.com/blog/developer-portal-platform-teams/platform-teams.png)

Concepts
- https://www.pulumi.com/docs/concepts/

References:
- https://www.pulumi.com/tutorials/pulumi-fundamentals/

### 1. Setup Pulumi CLI

Download & install Pulumi on your PC

```
curl -fsSL https://get.pulumi.com | sh
```

References:
- https://www.pulumi.com/docs/install/

Logging into State Backends

```
pulumi login
```

You will be promted:

```
Manage your Pulumi stacks by logging in.
Run `pulumi login --help` for alternative login options.
Enter your access token from https://app.pulumi.com/account/tokens
    or hit <ENTER> to log in using your browser                   : 
```

Ask grokking admin for access token or modify code to use your own state store

### 2. Init project from scratch (Optional)
...

### 3. Start pulumi fundamentals stack

At pulumi project dir `<playground>/iac`, run:

Activate pulumi env
```
source venv/bin/activate
```

List all stack saved in State Store
```
pulumi stack ls
```

Output should be like the text below if you login using grokking state store
```
pulumi stack ls   
NAME                  LAST UPDATE    RESOURCE COUNT  URL
pulumi-fundamentals*  2 minutes ago  9               https://app.pulumi.com/grokking-vietnam/iac/pulumi-fundamentals
```

Or create new stack 
```
pulumi stack init pulumi-fundamentals
```

Select the stack you want to up
```
pulumi stack select pulumi-fundamentals
```

Up the stack
```
pulumi up
```

Choose `yes`. Output should be like:
```
Previewing update (pulumi-fundamentals)

View in Browser (Ctrl+O): https://app.pulumi.com/grokking-vietnam/iac/pulumi-fundamentals/previews/9f2fb337-a3d8-432e-b357-0a090829b041

     Type                         Name                     Plan       
 +   pulumi:pulumi:Stack          iac-pulumi-fundamentals  create     
 +   ├─ docker:index:RemoteImage  backend_image            create     
 +   ├─ docker:index:RemoteImage  frontend_image           create     
 +   ├─ docker:index:RemoteImage  mongo_image              create     
 +   ├─ docker:index:Network      network                  create     
 +   ├─ docker:index:Container    frontend_container       create     
 +   ├─ docker:index:Container    mongo_container          create     
 +   └─ docker:index:Container    backend_container        create     

Resources:
    + 8 to create

Do you want to perform this update? yes
Updating (pulumi-fundamentals)

View in Browser (Ctrl+O): https://app.pulumi.com/grokking-vietnam/iac/pulumi-fundamentals/updates/6

     Type                         Name                     Status              
 +   pulumi:pulumi:Stack          iac-pulumi-fundamentals  created (0.62s)     
 +   ├─ docker:index:RemoteImage  backend_image            created (65s)       
 +   ├─ docker:index:RemoteImage  frontend_image           created (98s)       
 +   ├─ docker:index:Network      network                  created (3s)        
 +   ├─ docker:index:RemoteImage  mongo_image              created (98s)       
 +   ├─ docker:index:Container    frontend_container       created (13s)       
 +   ├─ docker:index:Container    mongo_container          created (13s)       
 +   └─ docker:index:Container    backend_container        created (1s)        

Resources:
    + 8 created

Duration: 1m58s
```


### 3. Create new stack