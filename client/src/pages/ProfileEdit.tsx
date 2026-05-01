import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Camera, MapPin, Save, UserRound } from 'lucide-react'
import { useToast } from '../stores/useToast'

export default function ProfileEdit() {
  const toast = useToast()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const photoPreview = useMemo(
    () => (photoFile ? URL.createObjectURL(photoFile) : null),
    [photoFile]
  )

  useEffect(
    () => () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    },
    [photoPreview]
  )

  function handleSave() {
    toast.success({
      title: 'Perfil salvo',
      message: 'Alteracoes locais aplicadas. Integrar com API para persistir.',
    })
  }

  return (
    <main className="min-h-screen w-full bg-[#f8f5ef] p-4 text-ink sm:p-5 md:p-6">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <Link
          to="/profile"
          className="inline-flex items-center gap-2 rounded-lg border border-line/55 bg-white px-3 py-2 text-sm font-medium text-ink-dim shadow-sm transition-colors hover:border-accent/35 hover:text-brand-deep"
        >
          <ArrowLeft size={16} />
          Voltar
        </Link>

        <section className="overflow-hidden rounded-2xl border border-line/45 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-accent via-brand-deep to-accent" />
          <div className="p-4 sm:p-5">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-brand-deep">
              <UserRound size={15} />
              Perfil
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-ink">
              Editar perfil
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-dim">
              Atualize seus dados publicos para facilitar trocas, doacoes e
              contato com outros leitores.
            </p>
          </div>
        </section>

        <form className="grid gap-5 rounded-2xl border border-line/45 bg-white p-4 shadow-sm sm:p-5 lg:grid-cols-[1fr_0.72fr]">
          <section className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-ink">Nome</span>
              <input
                type="text"
                defaultValue="Marcos Macedo"
                className="mt-2 h-11 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
              />
            </label>

            <div className="block">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <Camera size={16} className="text-brand-deep" />
                Foto de perfil
              </span>
              <label
                htmlFor="profile-photo-file"
                className="group mt-2 flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-line/55 bg-[#fbfaf7] px-3 py-4 text-center transition-colors hover:border-accent/55 hover:bg-white"
              >
                <input
                  id="profile-photo-file"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setPhotoFile(event.target.files?.[0] ?? null)
                  }
                  className="sr-only"
                />
                <span className="text-sm font-medium text-ink-dim group-hover:text-brand-deep">
                  Clique para enviar foto
                </span>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-ink">Bio</span>
              <textarea
                rows={5}
                defaultValue="Leitor de classicos brasileiros, tecnologia e ficcao cientifica."
                className="mt-2 w-full resize-none rounded-lg border border-line/55 bg-[#fbfaf7] px-3 py-2.5 text-sm leading-6 text-ink outline-none transition-colors focus:border-accent"
              />
            </label>

            <label className="block">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
                <MapPin size={16} className="text-brand-deep" />
                Cidade
              </span>
              <input
                type="text"
                defaultValue="Belo Horizonte, MG"
                className="mt-2 h-11 w-full rounded-lg border border-line/55 bg-[#fbfaf7] px-3 text-sm text-ink outline-none transition-colors focus:border-accent"
              />
            </label>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-white shadow-sm shadow-accent/15 transition-colors hover:bg-brand-deep"
            >
              <Save size={17} />
              Salvar perfil
            </button>
          </section>

          <aside className="rounded-xl border border-line/35 bg-[#fbfaf7] p-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-accent/15 bg-white text-accent shadow-sm">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Previa da foto de perfil"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound size={30} />
              )}
            </div>
            <h2 className="mt-4 text-base font-semibold text-ink">
              Previa publica
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-dim">
              Nome, foto, bio e cidade aparecem para outros usuarios quando eles
              visitam seu perfil publico ou veem seus livros anunciados.
            </p>
          </aside>
        </form>
      </div>
    </main>
  )
}
