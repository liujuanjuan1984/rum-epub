import {
  BrowserWindow,
  app,
  Menu,
  ipcMain,
  clipboard,
} from 'electron';
import { download } from 'electron-dl';
import { format } from 'date-fns';

export class MenuBuilder {
  public language = 'cn' as 'cn' | 'en';
  public cn = {
    service: '服务',
    hide: '隐藏',
    hideOther: '隐藏其他',
    showAll: '显示所有',
    quit: '退出',

    edit: '编辑',
    undo: '撤销',
    redo: '重做',
    cut: '剪切',
    copy: '复制',
    paste: '粘贴',
    saveImage: '将图片另存为(&v)…',
    selectAll: '全选',

    view: '视图',
    reload: '重新加载此页',
    devtools: '切换开发者工具',

    window: '窗口',
    min: '最小化',
    close: '关闭',
    front: '前置全部窗口',

    debug: '调试',
    exportLogs: '导出调试包',
  };

  public en = {
    service: 'Service',
    hide: 'Hide',
    hideOther: 'Hide Other',
    showAll: 'Show All',
    quit: 'Quit',

    edit: 'Edit',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    saveImage: 'Sa&ve Image As…',
    selectAll: 'Select All',

    view: 'View',
    reload: 'Reload App',
    devtools: 'Toggle Devtools',

    window: 'window',
    min: 'Minimize',
    close: 'Close',
    front: 'Arrange In Front',

    debug: 'Debug',
    exportLogs: 'Export Logs',
  };

  dispose = null;

  get lang() {
    return this[this.language];
  }

  constructor(public mainWindow: BrowserWindow) {
    ipcMain.on('change-language', (_, lang) => {
      this.language = lang;
      this.rebuildMenu();
    });
  }

  buildMenu() {
    this.setupContextMenu();

    if (process.platform === 'darwin') {
      const template = this.buildDarwinTemplate();

      const menu = Menu.buildFromTemplate(template as any);
      Menu.setApplicationMenu(menu);
    } else {
      Menu.setApplicationMenu(null);
    }
  }

  rebuildMenu() {
    if (process.platform === 'darwin') {
      const template = this.buildDarwinTemplate();

      const menu = Menu.buildFromTemplate(template as any);
      Menu.setApplicationMenu(menu);
    } else {
      Menu.setApplicationMenu(null);
    }
  }

  setupContextMenu() {
    this.mainWindow.webContents.on('context-menu', (_event, props) => {
      const hasText = props.selectionText.trim().length > 0;

      const menuTemplate = [
        (process.env.NODE_ENV === 'development' || process.env.devtool) && {
          id: 'inspect',
          label: 'I&nspect Element',
          click: () => {
            (this.mainWindow as any).inspectElement(props.x, props.y);
            if (this.mainWindow.webContents.isDevToolsOpened()) {
              (this.mainWindow as any).webContents.devToolsWebContents.focus();
            }
          },
        },
        {
          id: 'cut',
          label: this.lang.cut,
          accelerator: 'CommandOrControl+X',
          enabled: props.editFlags.canCut,
          visible: props.isEditable,
          click: (menuItem: any) => {
            const target = this.mainWindow.webContents;
            if (!menuItem.transform && target) {
              target.cut();
            } else {
              props.selectionText = menuItem.transform ? menuItem.transform(props.selectionText) : props.selectionText;
              clipboard.writeText(props.selectionText);
            }
          },
        },
        {
          id: 'copy',
          label: this.lang.copy,
          accelerator: 'CommandOrControl+C',
          enabled: props.editFlags.canCopy,
          visible: props.isEditable || hasText,
          click: (menuItem: any) => {
            const target = this.mainWindow.webContents;

            if (!menuItem.transform && target) {
              target.copy();
            } else {
              props.selectionText = menuItem.transform ? menuItem.transform(props.selectionText) : props.selectionText;
              clipboard.writeText(props.selectionText);
            }
          },
        },
        {
          id: 'paste',
          label: this.lang.paste,
          accelerator: 'CommandOrControl+V',
          enabled: props.editFlags.canPaste,
          visible: props.isEditable,
          click: (menuItem: any) => {
            const target = this.mainWindow.webContents;

            if (menuItem.transform) {
              let clipboardContent = clipboard.readText('clipboard');
              clipboardContent = menuItem.transform ? menuItem.transform(clipboardContent) : clipboardContent;
              target.insertText(clipboardContent);
            } else {
              target.paste();
            }
          },
        },
        {
          id: 'saveImageAs',
          label: this.lang.saveImage,
          visible: props.mediaType === 'image',
          click: () => {
            download(
              this.mainWindow,
              props.srcURL,
              {
                saveAs: true,
                filename: `Rum${format(new Date(), 'yyyy-MM-dd_hh-MM-ss')}.jpg`,
              },
            );
          },
        },
      ].filter(Boolean);

      Menu.buildFromTemplate(menuTemplate as any).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate() {
    const subMenuAbout = {
      label: 'Rum',
      submenu: [
        { label: this.lang.service, submenu: [] },
        { type: 'separator' },
        {
          label: this.lang.hide,
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: this.lang.hideOther,
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        { label: this.lang.showAll, selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: this.lang.quit,
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit = {
      label: this.lang.edit,
      submenu: [
        { label: this.lang.undo, accelerator: 'Command+Z', selector: 'undo:' },
        { label: this.lang.redo, accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: this.lang.cut, accelerator: 'Command+X', selector: 'cut:' },
        { label: this.lang.copy, accelerator: 'Command+C', selector: 'copy:' },
        { label: this.lang.paste, accelerator: 'Command+V', selector: 'paste:' },
        {
          label: this.lang.selectAll,
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    };
    const subMenuView = {
      label: this.lang.view,
      submenu: [
        {
          label: this.lang.reload,
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: this.lang.devtools,
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuWindow = {
      label: this.lang.window,
      submenu: [
        {
          label: this.lang.min,
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        { label: this.lang.close, accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: this.lang.front, selector: 'arrangeInFront:' },
      ],
    };

    const subMenuDebug = {
      label: this.lang.debug,
      submenu: [
        {
          label: this.lang.exportLogs,
          click: () => {
            this.mainWindow.webContents.send('export-logs');
          },
        },
      ],
    };

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuDebug];
  }

  buildDefaultTemplate() {
    return [];
  }
}
