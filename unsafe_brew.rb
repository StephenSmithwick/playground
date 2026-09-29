require "cask"

# WARNING: cask!(name) installs a cask Homebrew has marked `disable!`
# (i.e. fails Apple's notarization/signing check) and strips the
# quarantine attribute afterward.

def cask!(name)
  cask = ::Cask::CaskLoader.load(name)

  if cask.installed?
    puts "Using #{name}"
  else
    cask.define_singleton_method(:disabled?) { false }
    Cask::Installer.new(cask, force: true, verbose: true).install
    app_paths = Dir["#{cask.caskroom_path}/*/*.app"]
    system("xattr", "-dr", "com.apple.quarantine", *app_paths) unless app_paths.empty?
  end
end
