const AutoLaunch = require('auto-launch');
const autoLauncher = new AutoLaunch({
    name: "ElectronTray"
});

autoLauncher.isEnabled().then(function(isEnabled) {
  if (isEnabled) return;
   autoLauncher.enable();
}).catch(function (err) {
  throw err;
});
 

const { resolve, basename } = require('path')

const spawn = require('cross-spawn')

const FixPath = require('fix-path');

const { app ,Menu, Tray, dialog} = require('electron')

const Store = require('electron-store')

const database = new Store()

FixPath();

let tray = null

async function render(){
    if(!tray.isDestroyed()){
        tray.destroy();
        tray = new Tray(resolve(__dirname,'assets','mainIcon.png'))
    }

    const storedProjects = JSON.parse(JSON.stringify(database.store))

    const trayProjects = []

    for(let projectLabel in storedProjects){
        const project = {
            label: projectLabel,
                 submenu: [
                    {
                         label: 'Abrir no VSCode',
                         click: () => {
                            spawn.sync('code', [storedProjects[projectLabel]], {stdio: 'inherit'})
                        }
                    },
                    {
                        label: 'Remover',
                        click: () =>{
                            database.delete(projectLabel)
                            render()
                        }
                    }
                 ]
        }

        trayProjects.push(project)
    }

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Adicionar novo projeto ...',
            click:()=>{
                const result = dialog.showOpenDialogSync({ properties: ['openDirectory']})
                
                if(!result){ return }

                const [path] = result
                
                const name = basename(path)

                database.set(name,path)

                render();
            }
        },
        {
            type: 'separator'
        },
        ...trayProjects,
        {
            type: 'separator'
        },
    ])
    tray.setContextMenu(contextMenu)
    
}

app.on('ready', () =>{
    tray = new Tray(resolve(__dirname,'assets','mainIcon.png'))
    
    render();
})
