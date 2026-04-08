import { KeyPairUseCase } from './application/usecases/KeyPairUseCase';
import { KeyPairAdaptor } from './infrastructure/KeyPairAdaptor';

const generate = async () => {
    const generator = new KeyPairAdaptor();
    const useCase = new KeyPairUseCase(generator);

    await useCase.generateKeyAndSave();
};

generate();
