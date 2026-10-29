require "cask"
require "bundle/cask"

# cask!(name, sha256:, strip_quarantine: false) installs a cask Homebrew marked `disable!`.
#   sha256:           approved cask checksum (String, or Array for per-arch casks);
#                     install is refused on mismatch and the new value is printed
#   strip_quarantine: true to remove com.apple.quarantine from installed apps
UNSAFE_CASKS = {}
at_exit do
  next if UNSAFE_CASKS.empty?
  list = UNSAFE_CASKS.map { |n, strip| "\t- #{n}#{" (quarantine stripped)" if strip}" }
  Homebrew::Bundle::Cask.opoo "cask! installs casks Homebrew has disabled:\n#{list.join("\n")}"
end

module UnsafeCaskInstall
  def install!(name, preinstall: true, verbose: false, **options)
    unsafe = options[:unsafe]
    return super unless preinstall && unsafe

    cask = ::Cask::CaskLoader.load(options.fetch(:full_name, name))
    sha = cask.sha256.to_s.downcase
    unless unsafe[:sha256].any?{|s| sha.start_with? s and s.length >= 12 }
      onoe "cask! #{name}: checksum does not match.\n" \
           "#{cask.token} #{cask.version}\n" \
           "  cask:     #{source_url(cask) || "(no tap)"}\n" \
           "  download: #{cask.url}\n" \
           "To accept this version, set (optionally adding strip_quarantine: true):\n" \
           "  cask! #{name.inspect}, sha256: #{sha.inspect}"
      return false
    end

    cask.define_singleton_method(:disabled?) { false }
    ::Cask::Installer.new(cask, force: true, verbose:).install
    return true unless unsafe[:strip_quarantine]

    apps = cask.artifacts.grep(::Cask::Artifact::App).map { _1.target.to_s }
    apps.empty? || system("xattr", "-dr", "com.apple.quarantine", *apps)
  rescue => e
    onoe "cask! #{name}: #{e.message}"
    false
  end

  def source_url(cask)
    return unless (tap = cask.tap)
    return tap.remote if tap.custom_remote? && tap.remote

    "#{tap.default_remote}/blob/#{cask.tap_git_head || "HEAD"}/" \
      "#{cask.ruby_source_path || tap.relative_cask_path(cask.token)}"
  end
end
Homebrew::Bundle::Cask.singleton_class.prepend(UnsafeCaskInstall)

def cask!(name, sha256: nil, strip_quarantine: false, **options)
  UNSAFE_CASKS[name] = strip_quarantine
  cask(name, **options, unsafe: { sha256: Array(sha256).map { _1.to_s.downcase }, strip_quarantine: })
end
