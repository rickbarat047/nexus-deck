; NEXUS DECK Windows Installer
; Compile with Inno Setup Compiler (iscc.exe)

[Setup]
AppName=NEXUS DECK
AppVersion=0.1.0
AppPublisher=Nexus Deck
AppPublisherURL=https://github.com/rickbarat047/nexus-deck
DefaultDirName={pf}\Nexus Deck
DefaultGroupName=NEXUS DECK
AllowNoIcons=yes
LicenseFile=
OutputDir=installer
OutputBaseFilename=nexus-deck-setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop icon"; GroupDescription: "Additional icons:"; Flags: unchecked
Name: "autostart"; Description: "&Start NEXUS DECK on Windows login"; GroupDescription: "Additional options:"; Flags: checkedunchecked

[Files]
; Source: agent files
Source: "apps\agent\dist\*"; DestDir: "{app}\agent\dest"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "apps\agent\tray\*"; DestDir: "{app}\tray"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "apps\agent\agent-data\*"; DestDir: "{app}\agent-data"; Flags: ignoreversion recursesubdirs createallsubdirs

; Source: node_modules (needed for the agent to run)
Source: "apps\agent\node_modules\*"; DestDir: "{app}\agent\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs

; Source: package.json for reference
Source: "apps\agent\package.json"; DestDir: "{app}\agent"; Flags: ignoreversion

[Icons]
Name: "{group}\NEXUS DECK Agent"; Filename: "{app}\tray\tray-controller.js"
Name: "{group}\NEXUS DECK Agent - Stop"; Filename: "{app}\tray\tray-controller.js"; Parameters: "stop"
Name: "{group}\Uninstall NEXUS DECK"; Filename: "{uninstallexe}"
Name: "{desktop}\NEXUS DECK Agent"; Filename: "{app}\tray\tray-controller.js"; Tasks: desktopicon

[Registry]
Root: HKCU; SubKey: "Software\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "NexusDeckAgent"; ValueData: """{app}\tray\tray-controller.js"""; Tasks: autostart

[Run]
Filename: "{app}\tray\tray-controller.js"; Description: "Launch NEXUS DECK Agent"; Flags: nowait postinstall skipifsilent

[UninstallDelete]
Type: dir; Name: "{app}\agent-data"