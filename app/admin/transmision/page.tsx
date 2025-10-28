import { getAudioList, toggleBroadcastStatus } from '@/app/actions/audio'

import VoiceRecorder from './VoiceRecorderPage'
import AudioCard from './AudioCard'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'

import { set } from 'zod'

const transmision = async () => {
    

   
   const session = await getServerSession( authOptions);

    if(!session) {
        redirect('/api/auth/signin');

    }

     const roles = session.user?.roles || [];
  
const userId = session.user?.id || ''
console.log(userId)
const isAdmin = roles.includes('administrador');
console.log(isAdmin)

    if(!roles.includes('administrador') && !roles.includes('locutor')) return (
        <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">
                No tienes permiso para ver esta página, espera a que un administrador te asigne los permisos necesarios.
            </h1>
        </div>  
    )

    
     console.log(userId)
    
 const audios = await getAudioList(userId, isAdmin);

    
    
    
  return (
    <div className='p-5'>
        <VoiceRecorder userId={userId} />
        <h1 className='text-2xl font-bold mb-4'>Transmisión</h1>
        
        <ul>
            {audios.map((audio) => (
                
                <li key={audio.id} className="mb-2">
                    <AudioCard audio={audio} toggleBroadcastStatus={toggleBroadcastStatus} />
                </li>
            ))}
        </ul>
    </div>

  )
}

export default transmision