# raycaster

This was a small project I started out of interest after watching a few videos on the topic of Wolfenstein3D. I've learned that its 3d rendering engine was based upon the raycasting methodology, and after watching a few videos on the subject matter, I wanted to see if I'd be able to impelement my own raycasting engine. 

The project uses ElectronJS to render it as a desktop application, and Electron Forge for packaging and creating a distributable of the application. 

### Installation ###

If you're running a 32 bit version of Windows with an x64 architecture, you may download the `build-win32-x64.zip` and it should work on your machine, alternatively you can manually build the project.

After cloning the project and installing it with npm, run the command `npm run make` to package and generate a distributable of the application for, by default, your own system. To create distributables for other systems, refer to the [Electron Forge documentation](https://www.electronforge.io/cli#make). 
