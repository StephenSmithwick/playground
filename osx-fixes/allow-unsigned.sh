#! /bin/bash
cat << EOF > ~/disable-gatekeeper.mobileconfig
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>PayloadContent</key>
    <array>
      <dict>
        <key>PayloadType</key>
        <string>com.apple.systempolicy.control</string>
        <key>PayloadUUID</key>
        <string>$(uuidgen)</string>
        <key>PayloadIdentifier</key>
        <string>com.yourcompany.profile.systempolicy</string>
        <key>PayloadDisplayName</key>
        <string>System Policy Control</string>
        <key>PayloadDescription</key>
        <string>Configures System Policy Control settings</string>
        <key>PayloadVersion</key>
        <integer>1</integer>
        <key>EnableAssessment</key>
        <false />
      </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>Disable Gatekeeper</string>
    <key>PayloadIdentifier</key>
    <string>com.yourcompany.profile</string>
    <key>PayloadRemovalDisallowed</key>
    <false />
    <key>PayloadScope</key>
    <string>System</string>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>$(uuidgen)</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
  </dict>
</plist>
EOF

open ~/disable-gatekeeper.mobileconfig
open "x-apple.systempreferences:com.apple.preferences.configurationprofiles"
open "x-apple.systempreferences:com.apple.preferences.configurationprofiles"
